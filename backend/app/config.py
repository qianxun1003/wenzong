from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    supabase_service_key: str = ""

    # auto | openai | gemini | mock（mock = 免费测试，不调用大模型 API）
    llm_provider: str = "auto"

    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    embedding_model: str = "text-embedding-3-small"
    chat_model: str = "gpt-4o-mini"

    gemini_api_key: str = ""
    gemini_chat_model: str = "gemini-2.0-flash"
    gemini_embedding_model: str = "models/gemini-embedding-001"
    embedding_dimensions: int = 1536

    # 向量检索最低相似度，低于此值视为未命中讲义
    rag_similarity_threshold: float = 0.45

    cors_origins: str = "http://localhost:3000"

    # 统一账户 JWT（生产环境务必通过环境变量注入强随机密钥）
    jwt_secret: str = "dev-change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def resolved_provider(self) -> str:
        if self.llm_provider in ("openai", "gemini", "mock"):
            return self.llm_provider
        if self.gemini_api_key and not self.openai_api_key:
            return "gemini"
        if self.openai_api_key:
            return "openai"
        if self.gemini_api_key:
            return "gemini"
        return ""

    @property
    def llm_ready(self) -> bool:
        provider = self.resolved_provider
        if provider == "mock":
            return True
        if provider == "gemini":
            return bool(self.gemini_api_key)
        if provider == "openai":
            return bool(self.openai_api_key)
        return False


settings = Settings()
