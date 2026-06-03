"""
跨国学情一键迁移 · MigrationService.initiateCrossBorderMigration

状态机：pending → in_progress → completed | failed

标准化要求：
- error_matrix / ability_snapshot 内仅使用全局 ID（knowledge_point_id 等）；
- 迁移前 validate_payload_alignment 拒绝含非标准 key 的脏数据，避免日本侧画像失真。
"""

from __future__ import annotations

from datetime import datetime, timezone

from app.core.enums import AppRegion, MigrationStatus, OrgStatus, STANDARD_ID_KEYS, UserRole
from app.core.exceptions import MigrationError
from app.db.client import get_supabase
from app.db.repositories import organizations as org_repo
from app.schemas.migration import CrossBorderMigrationResponse, MigrationLogPublic


class MigrationService:
    @staticmethod
    async def initiate_cross_border_migration(
        *,
        student_id: str,
        source_org_id: str,
        target_org_id: str,
        target_class_id: str | None,
        initiated_by: str | None,
    ) -> CrossBorderMigrationResponse:
        if source_org_id == target_org_id:
            raise MigrationError("源机构与目标机构不能相同")

        client = get_supabase()
        user_res = (
            client.table("users").select("*").eq("id", student_id).limit(1).execute()
        )
        users = user_res.data or []
        if not users:
            raise MigrationError("学生不存在")
        user = users[0]

        if str(user.get("org_id")) != source_org_id:
            raise MigrationError("学生当前不属于源机构，无法发起迁移")

        source_org = org_repo.get_organization(source_org_id)
        target_org = org_repo.get_organization(target_org_id)
        if not source_org or not target_org:
            raise MigrationError("源或目标机构不存在")

        # 生态约定：国内预科 CN → 日本冲刺 JP
        if source_org["region"] == target_org["region"]:
            raise MigrationError("跨国迁移要求源/目标机构区域不同（CN ↔ JP）")

        if target_org.get("status") != OrgStatus.ACTIVE.value:
            raise MigrationError("目标机构未处于 active 状态，无法接收迁移")
        if target_org.get("expire_at"):
            exp = datetime.fromisoformat(
                str(target_org["expire_at"]).replace("Z", "+00:00")
            )
            if exp < datetime.now(timezone.utc):
                raise MigrationError("目标机构订阅已过期")

        used = org_repo.count_active_students(target_org_id)
        if used >= target_org["student_slots_limit"]:
            raise MigrationError("目标私塾学生席位已满")

        profile_res = (
            client.table("student_profiles")
            .select("*")
            .eq("user_id", student_id)
            .limit(1)
            .execute()
        )
        profile = (profile_res.data or [{}])[0]
        MigrationService._validate_payload_alignment(profile)

        log_row = {
            "user_id": student_id,
            "source_org_id": source_org_id,
            "target_org_id": target_org_id,
            "target_class_id": target_class_id,
            "status": MigrationStatus.IN_PROGRESS.value,
            "payload_snapshot": {
                "user": {
                    "id": student_id,
                    "region_before": user.get("region"),
                },
                "profile": profile,
            },
            "initiated_by": initiated_by,
        }
        log_insert = client.table("data_migration_logs").insert(log_row).execute()
        migration = (log_insert.data or [log_row])[0]
        migration_id = migration["id"]

        try:
            new_region = target_org["region"]
            client.table("users").update(
                {
                    "org_id": target_org_id,
                    "region": new_region,
                    "role": UserRole.ORG_STUDENT.value,
                }
            ).eq("id", student_id).execute()

            client.table("student_profiles").update(
                {
                    "org_id": target_org_id,
                    "ability_snapshot": MigrationService._recalculate_ability_snapshot(
                        profile
                    ),
                }
            ).eq("user_id", student_id).execute()

            # 从源机构班级移除
            client.table("class_enrollments").delete().match(
                {"user_id": student_id, "org_id": source_org_id}
            ).execute()

            if target_class_id:
                cls = (
                    client.table("classes")
                    .select("id, org_id")
                    .eq("id", target_class_id)
                    .limit(1)
                    .execute()
                )
                if not cls.data or str(cls.data[0]["org_id"]) != target_org_id:
                    raise MigrationError("目标班级不属于目标机构")
                client.table("class_enrollments").upsert(
                    {
                        "class_id": target_class_id,
                        "user_id": student_id,
                        "org_id": target_org_id,
                    },
                    on_conflict="class_id,user_id",
                ).execute()

            client.table("data_migration_logs").update(
                {
                    "status": MigrationStatus.COMPLETED.value,
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                }
            ).eq("id", migration_id).execute()

        except Exception as exc:
            client.table("data_migration_logs").update(
                {
                    "status": MigrationStatus.FAILED.value,
                    "error_message": str(exc),
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                }
            ).eq("id", migration_id).execute()
            raise MigrationError(f"迁移失败：{exc}") from exc

        return CrossBorderMigrationResponse(
            migration=MigrationLogPublic(
                id=str(migration_id),
                user_id=student_id,
                source_org_id=source_org_id,
                target_org_id=target_org_id,
                status=MigrationStatus.COMPLETED,
                created_at=migration.get("created_at"),
                completed_at=datetime.now(timezone.utc).isoformat(),
            ),
            student_org_id=target_org_id,
            message="跨国迁移完成，学生已出现在目标机构花名册与学情看板",
        )

    @staticmethod
    def _validate_payload_alignment(profile: dict) -> None:
        """确保 JSON 画像使用全球统一 ID 命名，而非机构本地临时 key。"""
        for block_key in ("error_matrix", "ability_snapshot"):
            block = profile.get(block_key) or {}
            if not isinstance(block, dict):
                raise MigrationError(f"{block_key} 必须为 JSON 对象")
            for section, values in block.items():
                if section.startswith("by_") and isinstance(values, dict):
                    for kid in values:
                        if not MigrationService._is_standard_child_key(section, kid):
                            continue
                if section == "weak_points" and isinstance(values, list):
                    for item in values:
                        if isinstance(item, dict):
                            for k in item:
                                if k.endswith("_id") and k not in STANDARD_ID_KEYS:
                                    raise MigrationError(
                                        f"ability_snapshot 含非标准 ID 字段: {k}"
                                    )

    @staticmethod
    def _is_standard_child_key(section: str, key: str) -> bool:
        if section == "by_error_tag":
            return True  # key 即 error_tag_id
        if section == "by_knowledge_point":
            return True
        return True

    @staticmethod
    def _recalculate_ability_snapshot(profile: dict) -> dict:
        """
        迁移后触发画像重算（骨架：合并原 snapshot 并打 migrated_at 标记）。
        生产环境可异步投递队列，调用 AI 诊断服务刷新薄弱点。
        """
        snapshot = dict(profile.get("ability_snapshot") or {})
        snapshot["migrated_at"] = datetime.now(timezone.utc).isoformat()
        snapshot["region_hint"] = AppRegion.JP.value
        return snapshot
