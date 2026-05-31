from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class AnswerMode(str, Enum):
    basic = "basic"
    eju = "eju"
    deep = "deep"
    chart = "chart"


ANSWER_MODE_LABELS: dict[AnswerMode, str] = {
    AnswerMode.basic: "基础模式",
    AnswerMode.eju: "EJU模式",
    AnswerMode.deep: "深度模式",
    AnswerMode.chart: "图表模式",
}

SECTION_KEYS = (
    "core_conclusion",
    "background",
    "process",
    "eju_points",
    "pitfalls",
    "related_knowledge",
    "related_charts",
    "related_quiz",
)

SECTION_TITLES: dict[str, str] = {
    "core_conclusion": "核心结论",
    "background": "背景原因",
    "process": "具体过程",
    "eju_points": "EJU考点",
    "pitfalls": "易错点",
    "related_knowledge": "相关知识点",
    "related_charts": "相关图表",
    "related_quiz": "相关Quiz",
}


class AnswerSection(BaseModel):
    key: str
    title: str
    content: str


class Citation(BaseModel):
    id: str | None = None
    tag: str | None = None
    snippet: str
    similarity: float | None = None


class StructuredAnswer(BaseModel):
    sections: list[AnswerSection]
    citations: list[Citation] = Field(default_factory=list)
    rag_used: bool = True
    answer_mode: AnswerMode = AnswerMode.basic


def empty_sections() -> list[AnswerSection]:
    return [
        AnswerSection(key=key, title=SECTION_TITLES[key], content="讲义未覆盖")
        for key in SECTION_KEYS
    ]


def sections_to_reply(sections: list[AnswerSection]) -> str:
    parts: list[str] = []
    for section in sections:
        content = section.content.strip()
        if content and content != "讲义未覆盖":
            parts.append(f"## {section.title}\n{content}")
    if not parts:
        return "老师尚未录入相关知识点，请向老师反馈或稍后再试。"
    return "\n\n".join(parts)


def normalize_sections(raw: list[dict] | None) -> list[AnswerSection]:
    by_key: dict[str, AnswerSection] = {}
    if raw:
        for item in raw:
            key = str(item.get("key", "")).strip()
            if key not in SECTION_TITLES:
                continue
            content = str(item.get("content", "")).strip() or "讲义未覆盖"
            by_key[key] = AnswerSection(
                key=key,
                title=SECTION_TITLES[key],
                content=content,
            )
    return [
        by_key.get(
            key,
            AnswerSection(key=key, title=SECTION_TITLES[key], content="讲义未覆盖"),
        )
        for key in SECTION_KEYS
    ]
