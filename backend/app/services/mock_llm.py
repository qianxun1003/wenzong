"""零成本测试模式：不调用任何付费 API，用关键词检索 + 模板回答。"""

from app.schemas.chat import (
    AnswerMode,
    AnswerSection,
    StructuredAnswer,
    SECTION_TITLES,
)
from app.prompts import MODE_INSTRUCTIONS


def embed_text(_text: str) -> list[float]:
    # 占位向量，满足数据库字段；检索走关键词，不用此向量
    return [0.0] * 1536


def embed_texts(texts: list[str]) -> list[list[float]]:
    return [embed_text(t) for t in texts]


def _first_snippet(context: str, max_len: int = 280) -> str:
    chunk = context.split("\n\n---\n\n")[0]
    chunk = chunk.replace("【", "").strip()
    if len(chunk) <= max_len:
        return chunk
    return chunk[:max_len] + "…"


def generate_structured_answer(
    question: str,
    context: str,
    mode: AnswerMode,
) -> StructuredAnswer:
    if not context.strip():
        from app.schemas.chat import empty_sections

        sections = empty_sections()
        sections[0] = AnswerSection(
            key="core_conclusion",
            title="核心结论",
            content="老师尚未录入相关知识点，请向老师反馈或稍后再试。",
        )
        return StructuredAnswer(sections=sections, answer_mode=mode, rag_used=False)

    snippet = _first_snippet(context)
    mode_hint = MODE_INSTRUCTIONS[mode].split("\n")[0]

    sections = [
        AnswerSection(
            key="core_conclusion",
            title=SECTION_TITLES["core_conclusion"],
            content=f"【测试模式 · 未调用大模型】\n{mode_hint}\n\n根据讲义：{snippet}",
        ),
        AnswerSection(
            key="background",
            title=SECTION_TITLES["background"],
            content="讲义未覆盖" if mode != AnswerMode.deep else f"（测试模式）讲义摘录见下方引用。\n{snippet}",
        ),
        AnswerSection(
            key="process",
            title=SECTION_TITLES["process"],
            content=f"（测试模式）你的问题：{question}\n\n正式环境配置 Gemini/OpenAI 后将生成完整结构化回答。",
        ),
        AnswerSection(
            key="eju_points",
            title=SECTION_TITLES["eju_points"],
            content="讲义未覆盖" if mode != AnswerMode.eju else "（测试模式）EJU 考点需大模型归纳，请配置 API 后使用。",
        ),
        AnswerSection(
            key="pitfalls",
            title=SECTION_TITLES["pitfalls"],
            content="讲义未覆盖" if mode != AnswerMode.eju else "（测试模式）易错点需大模型归纳。",
        ),
        AnswerSection(
            key="related_knowledge",
            title=SECTION_TITLES["related_knowledge"],
            content="讲义未覆盖" if mode != AnswerMode.deep else snippet,
        ),
        AnswerSection(
            key="related_charts",
            title=SECTION_TITLES["related_charts"],
            content="讲义未覆盖" if mode != AnswerMode.chart else "（测试模式）图表解读需大模型生成。",
        ),
        AnswerSection(
            key="related_quiz",
            title=SECTION_TITLES["related_quiz"],
            content="讲义未覆盖",
        ),
    ]
    return StructuredAnswer(sections=sections, answer_mode=mode, rag_used=True)
