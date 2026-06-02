from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.schemas.chat import AnswerMode, AnswerSection, Citation
from app.services.popular_questions import list_popular_questions, record_popular_question
from app.services.rag import answer_question, structured_to_reply

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    session_id: str | None = None
    answer_mode: AnswerMode = AnswerMode.basic


class ChatResponse(BaseModel):
    reply: str
    sections: list[AnswerSection]
    citations: list[Citation]
    answer_mode: AnswerMode
    rag_used: bool
    session_id: str


class PopularQuestionItem(BaseModel):
    id: str
    question_display: str
    ask_count: int
    last_answer_mode: AnswerMode
    last_reply: str
    last_sections: list[AnswerSection]
    last_citations: list[Citation]
    last_asked_at: str


class PopularQuestionsResponse(BaseModel):
    items: list[PopularQuestionItem]
    updated_at: str


@router.get("/popular-questions", response_model=PopularQuestionsResponse)
async def get_popular_questions(limit: int = 30):
    from datetime import datetime, timezone

    rows = list_popular_questions(limit=limit)
    items: list[PopularQuestionItem] = []
    for row in rows:
        try:
            mode = AnswerMode(row.get("last_answer_mode") or "basic")
        except ValueError:
            mode = AnswerMode.basic
        sections: list[AnswerSection] = []
        for s in row.get("last_sections") or []:
            if isinstance(s, dict):
                sections.append(
                    AnswerSection(
                        key=str(s.get("key", "")),
                        title=str(s.get("title", "")),
                        content=str(s.get("content", "")),
                    )
                )
        citations: list[Citation] = []
        for c in row.get("last_citations") or []:
            if isinstance(c, dict):
                citations.append(
                    Citation(
                        id=c.get("id"),
                        tag=c.get("tag"),
                        snippet=str(c.get("snippet", "")),
                        similarity=c.get("similarity"),
                    )
                )
        items.append(
            PopularQuestionItem(
                id=str(row.get("id", "")),
                question_display=str(row.get("question_display", "")),
                ask_count=int(row.get("ask_count", 0)),
                last_answer_mode=mode,
                last_reply=str(row.get("last_reply", "")),
                last_sections=sections,
                last_citations=citations,
                last_asked_at=str(row.get("last_asked_at", "")),
            )
        )
    return PopularQuestionsResponse(
        items=items,
        updated_at=datetime.now(timezone.utc).isoformat(),
    )


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        answer = await answer_question(req.message.strip(), req.answer_mode)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"问答失败：{e}") from e
    reply = structured_to_reply(answer)
    record_popular_question(
        req.message.strip(),
        answer.answer_mode.value,
        reply,
        answer.sections,
        answer.citations,
    )
    return ChatResponse(
        reply=reply,
        sections=answer.sections,
        citations=answer.citations,
        answer_mode=answer.answer_mode,
        rag_used=answer.rag_used,
        session_id=req.session_id or "default",
    )
