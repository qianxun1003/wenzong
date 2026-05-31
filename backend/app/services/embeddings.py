from openai import OpenAI

from app.config import settings


def _openai_client() -> OpenAI:
    if not settings.openai_api_key:
        raise RuntimeError("请配置 OPENAI_API_KEY")
    return OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)


def _embed_openai(text: str) -> list[float]:
    client = _openai_client()
    response = client.embeddings.create(model=settings.embedding_model, input=text)
    return response.data[0].embedding


def _embed_openai_batch(texts: list[str]) -> list[list[float]]:
    client = _openai_client()
    response = client.embeddings.create(model=settings.embedding_model, input=texts)
    return [item.embedding for item in response.data]


async def embed_text(text: str) -> list[float]:
    if settings.resolved_provider == "mock":
        from app.services.mock_llm import embed_text as mock_embed

        return mock_embed(text)
    if settings.resolved_provider == "gemini":
        from app.services.gemini_client import embed_text as gemini_embed

        return gemini_embed(text, task_type="retrieval_query")
    return _embed_openai(text)


async def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    if settings.resolved_provider == "mock":
        from app.services.mock_llm import embed_texts as mock_embed_batch

        return mock_embed_batch(texts)
    if settings.resolved_provider == "gemini":
        from app.services.gemini_client import embed_texts as gemini_embed_batch

        return gemini_embed_batch(texts, task_type="retrieval_document")
    return _embed_openai_batch(texts)
