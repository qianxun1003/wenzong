"""
大纲/题库数据库文件上传审计

与现有 documents 向量上传解耦：
- documents → RAG 讲义切片；
- db_upload_logs → 整库版本包（如 2026 版大纲 SQL/JSON）的管理记录。
"""

from __future__ import annotations

from app.db.client import get_supabase
from app.schemas.db_management import DbUploadLogCreate, DbUploadLogPublic


class DbUploadService:
    @staticmethod
    def record_upload(
        payload: DbUploadLogCreate,
        uploaded_by: str | None,
    ) -> DbUploadLogPublic:
        row = {
            "filename": payload.filename,
            "uploaded_by": uploaded_by,
            "target_version": payload.target_version,
            "file_size_bytes": payload.file_size_bytes,
            "storage_path": payload.storage_path,
            "notes": payload.notes,
        }
        r = get_supabase().table("db_upload_logs").insert(row).execute()
        data = (r.data or [row])[0]
        return DbUploadLogPublic(
            id=str(data["id"]),
            filename=data["filename"],
            uploaded_by=data.get("uploaded_by"),
            target_version=data["target_version"],
            created_at=data.get("created_at"),
        )

    @staticmethod
    def list_logs(limit: int = 50) -> list[DbUploadLogPublic]:
        r = (
            get_supabase()
            .table("db_upload_logs")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return [
            DbUploadLogPublic(
                id=str(row["id"]),
                filename=row["filename"],
                uploaded_by=row.get("uploaded_by"),
                target_version=row["target_version"],
                created_at=row.get("created_at"),
            )
            for row in (r.data or [])
        ]
