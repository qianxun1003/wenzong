from pydantic import BaseModel, Field


class DbUploadLogCreate(BaseModel):
    filename: str = Field(min_length=1, max_length=500)
    target_version: str = Field(
        min_length=1,
        max_length=100,
        description="如 2026版文综大纲",
    )
    file_size_bytes: int | None = Field(default=None, ge=0)
    storage_path: str | None = None
    notes: str | None = None


class DbUploadLogPublic(BaseModel):
    id: str
    filename: str
    uploaded_by: str | None = None
    target_version: str
    created_at: str | None = None
