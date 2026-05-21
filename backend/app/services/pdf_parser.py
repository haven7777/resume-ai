import os
import tempfile
from pathlib import Path

from fastapi import UploadFile


async def parse_pdf(file: UploadFile) -> str:
    """
    Parse text from a PDF upload.
    Uses LlamaParse when LLAMA_CLOUD_API_KEY is set (handles multi-column layouts).
    Falls back to pypdf for basic extraction.
    """
    contents = await file.read()

    if os.getenv("LLAMA_CLOUD_API_KEY"):
        return await _parse_with_llamaparse(contents, file.filename or "resume.pdf")

    return _parse_with_pypdf(contents)


async def _parse_with_llamaparse(contents: bytes, filename: str) -> str:
    from llama_parse import LlamaParse

    parser = LlamaParse(
        api_key=os.getenv("LLAMA_CLOUD_API_KEY"),
        result_type="markdown",
        verbose=False,
    )

    with tempfile.NamedTemporaryFile(suffix=Path(filename).suffix, delete=False) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        docs = await parser.aload_data(tmp_path)
        return "\n\n".join(doc.text for doc in docs)
    finally:
        os.unlink(tmp_path)


def _parse_with_pypdf(contents: bytes) -> str:
    import io
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(contents))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n\n".join(pages).strip()
