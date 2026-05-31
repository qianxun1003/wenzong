from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.schemas.chat import AnswerMode, AnswerSection, Citation
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


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        answer = await answer_question(req.message.strip(), req.answer_mode)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"问答失败：{e}") from e
    return ChatResponse(
        reply=structured_to_reply(answer),
        sections=answer.sections,
        citations=answer.citations,
        answer_mode=answer.answer_mode,
        rag_used=answer.rag_used,
        session_id=req.session_id or "default",
    )
