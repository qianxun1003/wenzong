"""全站热门问题统计：按规范化问句聚合，保留最近一次完整解答。"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import Any

from app.config import settings
from app.services.supabase_store import get_supabase

logger = logging.getLogger(__name__)

_memory_store: dict[str, dict[str, Any]] = {}


def normalize_question(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip())


def _sections_payload(sections: list[Any]) -> list[dict]:
    out: list[dict] = []
    for s in sections:
        if hasattr(s, "model_dump"):
            out.append(s.model_dump())
        elif isinstance(s, dict):
            out.append(s)
    return out


def _citations_payload(citations: list[Any]) -> list[dict]:
    out: list[dict] = []
    for c in citations:
        if hasattr(c, "model_dump"):
            out.append(c.model_dump())
        elif isinstance(c, dict):
            out.append(c)
    return out


def _record_memory(
    question: str,
    answer_mode: str,
    reply: str,
    sections: list[Any],
    citations: list[Any],
) -> None:
    norm = normalize_question(question)
    if not norm:
        return
    now = datetime.now(timezone.utc).isoformat()
    row = _memory_store.get(norm)
    if row:
        row["ask_count"] = int(row["ask_count"]) + 1
    else:
        row = {
            "id": norm[:32],
            "question_normalized": norm,
            "question_display": question.strip(),
            "ask_count": 1,
            "created_at": now,
        }
        _memory_store[norm] = row
    row["last_answer_mode"] = answer_mode
    row["last_reply"] = reply
    row["last_sections"] = _sections_payload(sections)
    row["last_citations"] = _citations_payload(citations)
    row["last_asked_at"] = now


def _record_supabase(
    question: str,
    answer_mode: str,
    reply: str,
    sections: list[Any],
    citations: list[Any],
) -> None:
    norm = normalize_question(question)
    if not norm:
        return
    client = get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    payload = {
        "question_display": question.strip(),
        "question_normalized": norm,
        "last_answer_mode": answer_mode,
        "last_reply": reply,
        "last_sections": _sections_payload(sections),
        "last_citations": _citations_payload(citations),
        "last_asked_at": now,
    }
    existing = (
        client.table("popular_questions")
        .select("id, ask_count")
        .eq("question_normalized", norm)
        .limit(1)
        .execute()
    )
    if existing.data:
        row = existing.data[0]
        client.table("popular_questions").update(
            {**payload, "ask_count": int(row["ask_count"]) + 1}
        ).eq("id", row["id"]).execute()
    else:
        client.table("popular_questions").insert(
            {**payload, "ask_count": 1}
        ).execute()


def record_popular_question(
    question: str,
    answer_mode: str,
    reply: str,
    sections: list[Any],
    citations: list[Any],
) -> None:
    """记录一次问答；失败时静默，不影响主流程。"""
    try:
        if settings.supabase_url and settings.supabase_service_key:
            _record_supabase(question, answer_mode, reply, sections, citations)
        else:
            _record_memory(question, answer_mode, reply, sections, citations)
    except Exception:
        logger.warning("popular_questions record failed", exc_info=True)


def list_popular_questions(limit: int = 30) -> list[dict[str, Any]]:
    limit = max(1, min(limit, 100))
    if settings.supabase_url and settings.supabase_service_key:
        try:
            client = get_supabase()
            result = (
                client.table("popular_questions")
                .select(
                    "id, question_display, ask_count, last_answer_mode, "
                    "last_reply, last_sections, last_citations, last_asked_at"
                )
                .order("ask_count", desc=True)
                .order("last_asked_at", desc=True)
                .limit(limit)
                .execute()
            )
            return result.data or []
        except Exception as e:
            logger.warning("popular_questions list failed: %s", e)
            return _list_memory(limit)

    return _list_memory(limit)


def _list_memory(limit: int) -> list[dict[str, Any]]:
    rows = sorted(
        _memory_store.values(),
        key=lambda r: (int(r.get("ask_count", 0)), str(r.get("last_asked_at", ""))),
        reverse=True,
    )
    return rows[:limit]
