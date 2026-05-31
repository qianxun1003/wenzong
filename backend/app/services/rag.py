import json
import re
from dataclasses import dataclass

from openai import OpenAI

from app.config import settings
from app.prompts import get_system_prompt
from app.schemas.chat import (
    AnswerMode,
    AnswerSection,
    Citation,
    StructuredAnswer,
    empty_sections,
    normalize_sections,
    sections_to_reply,
)
from app.services.embeddings import embed_text
from app.services.supabase_store import search_similar

NO_KNOWLEDGE_MESSAGE = "老师尚未录入相关知识点，请向老师反馈或稍后再试。"


@dataclass
class RetrievalResult:
    context: str
    docs: list[dict]


async def retrieve_context(question: str, top_k: int = 5) -> RetrievalResult:
    if settings.resolved_provider == "mock":
        from app.services.supabase_store import search_by_keywords

        docs = await search_by_keywords(question, limit=top_k)
    else:
        query_embedding = await embed_text(question)
        docs = await search_similar(query_embedding, limit=top_k)

    if not docs:
        return RetrievalResult(context="", docs=[])

    best_similarity = max((doc.get("similarity") or 0.0) for doc in docs)
    if best_similarity < settings.rag_similarity_threshold:
        return RetrievalResult(context="", docs=[])

    parts = []
    for i, doc in enumerate(docs, 1):
        tag = doc.get("tag") or doc.get("source") or "讲义"
        content = doc.get("content", "")
        parts.append(f"【片段 {i} · {tag}】\n{content}")
    return RetrievalResult(context="\n\n---\n\n".join(parts), docs=docs)


def build_citations(docs: list[dict]) -> list[Citation]:
    citations: list[Citation] = []
    for doc in docs:
        content = str(doc.get("content", "")).strip()
        if not content:
            continue
        snippet = content if len(content) <= 160 else content[:160] + "…"
        citations.append(
            Citation(
                id=str(doc.get("id")) if doc.get("id") is not None else None,
                tag=doc.get("tag") or doc.get("source"),
                snippet=snippet,
                similarity=doc.get("similarity"),
            )
        )
    return citations


def _extract_json(text: str) -> dict | None:
    text = text.strip()
    if not text:
        return None

    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fence_match:
        text = fence_match.group(1).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            return None
    return None


def _parse_structured_response(raw: str, mode: AnswerMode) -> StructuredAnswer:
    payload = _extract_json(raw)
    if payload and isinstance(payload.get("sections"), list):
        sections = normalize_sections(payload["sections"])
        return StructuredAnswer(sections=sections, answer_mode=mode, rag_used=True)
    return StructuredAnswer(
        sections=[
            AnswerSection(
                key="core_conclusion",
                title="核心结论",
                content=raw.strip() or NO_KNOWLEDGE_MESSAGE,
            ),
            *empty_sections()[1:],
        ],
        answer_mode=mode,
        rag_used=True,
    )


def _no_knowledge_answer(mode: AnswerMode) -> StructuredAnswer:
    sections = empty_sections()
    sections[0] = AnswerSection(
        key="core_conclusion",
        title="核心结论",
        content=NO_KNOWLEDGE_MESSAGE,
    )
    return StructuredAnswer(sections=sections, answer_mode=mode, rag_used=False)


async def generate_answer(
    question: str,
    context: str,
    mode: AnswerMode,
) -> StructuredAnswer:
    if not context.strip():
        return _no_knowledge_answer(mode)

    if settings.resolved_provider == "mock":
        from app.services.mock_llm import generate_structured_answer

        return await _run_sync(generate_structured_answer, question, context, mode)

    system = get_system_prompt(mode, context)

    if settings.resolved_provider == "gemini":
        from app.services.gemini_client import generate_answer as gemini_generate

        raw = await _run_sync(gemini_generate, system, question)
        return _parse_structured_response(raw, mode)

    if not settings.openai_api_key:
        raise RuntimeError("请配置 OPENAI_API_KEY、GEMINI_API_KEY，或使用 LLM_PROVIDER=mock")

    client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)
    response = client.chat.completions.create(
        model=settings.chat_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": question},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )
    raw = response.choices[0].message.content or ""
    return _parse_structured_response(raw, mode)


async def _run_sync(fn, *args):
    import asyncio

    return await asyncio.to_thread(fn, *args)


async def answer_question(question: str, mode: AnswerMode = AnswerMode.basic) -> StructuredAnswer:
    if not settings.llm_ready:
        raise RuntimeError(
            "请配置 GEMINI_API_KEY / OPENAI_API_KEY，或设置 LLM_PROVIDER=mock 进行免费测试"
        )
    retrieval = await retrieve_context(question)
    answer = await generate_answer(question, retrieval.context, mode)
    answer.citations = build_citations(retrieval.docs)
    return answer


def structured_to_reply(answer: StructuredAnswer) -> str:
    return sections_to_reply(answer.sections)
