import google.generativeai as genai

from app.config import settings


def _configure() -> None:
    if not settings.gemini_api_key:
        raise RuntimeError("请配置 GEMINI_API_KEY（https://aistudio.google.com/apikey）")
    genai.configure(api_key=settings.gemini_api_key)


def embed_text(text: str, task_type: str = "retrieval_document") -> list[float]:
    _configure()
    result = genai.embed_content(
        model=settings.gemini_embedding_model,
        content=text,
        task_type=task_type,
        output_dimensionality=settings.embedding_dimensions,
    )
    return list(result["embedding"])


def embed_texts(texts: list[str], task_type: str = "retrieval_document") -> list[list[float]]:
    return [embed_text(t, task_type=task_type) for t in texts]


def generate_answer(system_prompt: str, question: str) -> str:
    _configure()
    model = genai.GenerativeModel(
        model_name=settings.gemini_chat_model,
        system_instruction=system_prompt,
    )
    response = model.generate_content(
        question,
        generation_config=genai.types.GenerationConfig(temperature=0.3),
    )
    return (response.text or "").strip()
