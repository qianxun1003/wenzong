import io
from pathlib import Path


def parse_markdown(content: bytes) -> str:
    return content.decode("utf-8", errors="replace")


def parse_pdf(content: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(content))
    return "\n\n".join(page.extract_text() or "" for page in reader.pages)


def parse_docx(content: bytes) -> str:
    from docx import Document

    doc = Document(io.BytesIO(content))
    return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())


def parse_file(filename: str, content: bytes) -> str:
    ext = Path(filename).suffix.lower()
    if ext in {".md", ".markdown"}:
        return parse_markdown(content)
    if ext == ".pdf":
        return parse_pdf(content)
    if ext in {".doc", ".docx"}:
        return parse_docx(content)
    raise ValueError(f"不支持的文件格式: {ext}")


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", "。", "！", "？", "；", " ", ""],
    )
    return splitter.split_text(text)
