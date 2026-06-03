from pydantic import BaseModel, Field


class StudentAnalyticsQuery(BaseModel):
    """ToB 学情看板查询；org_id 必须与 token 内机构一致。"""

    org_id: str
    class_id: str | None = None


class ErrorTagStat(BaseModel):
    error_tag_id: str
    count: int


class KnowledgeWeakness(BaseModel):
    knowledge_point_id: str
    mastery: float = Field(ge=0, le=1)
    label: str | None = None


class StudentAnalyticsItem(BaseModel):
    user_id: str
    display_name: str | None = None
    class_ids: list[str] = []
    current_chapter_id: str | None = None
    total_quiz_count: int = 0
    correct_rate: float = 0.0
    last_active_at: str | None = None
    top_error_tags: list[ErrorTagStat] = []
    weak_knowledge_points: list[KnowledgeWeakness] = []


class TeacherDashboardResponse(BaseModel):
    org_id: str
    teacher_id: str
    class_count: int
    students: list[StudentAnalyticsItem]
