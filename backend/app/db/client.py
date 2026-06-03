from supabase import Client, create_client

from app.config import settings


def get_supabase() -> Client:
    if not settings.supabase_url or not settings.supabase_service_key:
        raise RuntimeError("请配置 SUPABASE_URL 和 SUPABASE_SERVICE_KEY")
    return create_client(settings.supabase_url, settings.supabase_service_key)
