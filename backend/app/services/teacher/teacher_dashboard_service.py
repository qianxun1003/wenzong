"""
ToB 学情看板 · TeacherDashboardService.getStudentAnalytics

多租户鉴权要点：
1. teacher_id 必须属于请求的 org_id（或 super_admin）；
2. 班级列表查询强制 .eq("org_id", org_id)；
3. 花名册、student_profiles 二次校验 org_id，防止 JOIN 遗漏导致越权。
"""

from __future__ import annotations

from app.core.tenant import assert_teacher_in_org, tenant_filter
from app.db.client import get_supabase
from app.schemas.teacher import (
    ErrorTagStat,
    KnowledgeWeakness,
    StudentAnalyticsItem,
    TeacherDashboardResponse,
)


class TeacherDashboardService:
    @staticmethod
    async def get_student_analytics(
        *,
        teacher_id: str,
        org_id: str,
        class_id: str | None = None,
    ) -> TeacherDashboardResponse:
        client = get_supabase()
        teacher_row = (
            client.table("users").select("*").eq("id", teacher_id).limit(1).execute()
        )
        teachers = teacher_row.data or []
        if not teachers:
            from app.core.exceptions import PlatformError

            raise PlatformError("教师账号不存在")
        assert_teacher_in_org(teachers[0], org_id)

        class_query = (
            client.table("classes")
            .select("id, name, teacher_id")
            .match(tenant_filter(org_id))
        )
        if class_id:
            class_query = class_query.eq("id", class_id)
        else:
            class_query = class_query.eq("teacher_id", teacher_id)

        classes_res = class_query.execute()
        classes = classes_res.data or []
        class_ids = [str(c["id"]) for c in classes]

        if not class_ids:
            return TeacherDashboardResponse(
                org_id=org_id,
                teacher_id=teacher_id,
                class_count=0,
                students=[],
            )

        enroll_res = (
            client.table("class_enrollments")
            .select("user_id, class_id")
            .match(tenant_filter(org_id))
            .in_("class_id", class_ids)
            .execute()
        )
        enrollments = enroll_res.data or []
        user_ids = list({str(e["user_id"]) for e in enrollments})
        if not user_ids:
            return TeacherDashboardResponse(
                org_id=org_id,
                teacher_id=teacher_id,
                class_count=len(class_ids),
                students=[],
            )

        users_res = (
            client.table("users")
            .select("id, display_name, last_active_at, org_id")
            .match(tenant_filter(org_id))
            .in_("id", user_ids)
            .execute()
        )
        users_map = {str(u["id"]): u for u in (users_res.data or [])}

        profiles_res = (
            client.table("student_profiles")
            .select(
                "user_id, org_id, current_chapter_id, total_quiz_count, "
                "correct_rate, error_matrix, ability_snapshot"
            )
            .in_("user_id", user_ids)
            .execute()
        )
        profiles_map = {str(p["user_id"]): p for p in (profiles_res.data or [])}

        class_by_user: dict[str, list[str]] = {}
        for e in enrollments:
            uid = str(e["user_id"])
            class_by_user.setdefault(uid, []).append(str(e["class_id"]))

        students: list[StudentAnalyticsItem] = []
        for uid in user_ids:
            user = users_map.get(uid, {})
            # 二次 org 校验：profile 与 user 必须同属本租户
            if user.get("org_id") and str(user["org_id"]) != org_id:
                continue
            profile = profiles_map.get(uid, {})
            if profile.get("org_id") and str(profile["org_id"]) != org_id:
                continue

            error_matrix = profile.get("error_matrix") or {}
            top_tags = TeacherDashboardService._top_error_tags(error_matrix, limit=5)
            weak_kps = TeacherDashboardService._weak_knowledge_points(
                error_matrix,
                profile.get("ability_snapshot") or {},
            )

            students.append(
                StudentAnalyticsItem(
                    user_id=uid,
                    display_name=user.get("display_name"),
                    class_ids=class_by_user.get(uid, []),
                    current_chapter_id=profile.get("current_chapter_id"),
                    total_quiz_count=int(profile.get("total_quiz_count") or 0),
                    correct_rate=float(profile.get("correct_rate") or 0),
                    last_active_at=user.get("last_active_at"),
                    top_error_tags=top_tags,
                    weak_knowledge_points=weak_kps,
                )
            )

        students.sort(key=lambda s: s.correct_rate)

        return TeacherDashboardResponse(
            org_id=org_id,
            teacher_id=teacher_id,
            class_count=len(class_ids),
            students=students,
        )

    @staticmethod
    def _top_error_tags(error_matrix: dict, limit: int) -> list[ErrorTagStat]:
        """
        error_matrix 约定结构（跨国迁移时原样搬迁）：
        { "by_error_tag": { "error_tag_id": count, ... } }
        """
        by_tag = error_matrix.get("by_error_tag") or {}
        items = [
            ErrorTagStat(error_tag_id=str(tag_id), count=int(cnt))
            for tag_id, cnt in by_tag.items()
        ]
        items.sort(key=lambda x: x.count, reverse=True)
        return items[:limit]

    @staticmethod
    def _weak_knowledge_points(
        error_matrix: dict,
        ability_snapshot: dict,
    ) -> list[KnowledgeWeakness]:
        """
        优先读 ability_snapshot.weak_points；
        否则从 by_knowledge_point 中取掌握度最低的考点（全局 knowledge_point_id）。
        """
        weak = ability_snapshot.get("weak_points")
        if isinstance(weak, list) and weak:
            out: list[KnowledgeWeakness] = []
            for item in weak[:5]:
                if isinstance(item, dict) and item.get("knowledge_point_id"):
                    out.append(
                        KnowledgeWeakness(
                            knowledge_point_id=str(item["knowledge_point_id"]),
                            mastery=float(item.get("mastery", 0)),
                            label=item.get("label"),
                        )
                    )
            return out

        by_kp = error_matrix.get("by_knowledge_point") or {}
        ranked = sorted(by_kp.items(), key=lambda kv: float(kv[1]))
        return [
            KnowledgeWeakness(
                knowledge_point_id=str(kp_id),
                mastery=float(score),
            )
            for kp_id, score in ranked[:5]
        ]
