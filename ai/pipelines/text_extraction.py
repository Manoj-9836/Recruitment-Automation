from __future__ import annotations

from io import BytesIO


def _extract_pdf_text(content: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        return ""

    try:
        reader = PdfReader(BytesIO(content))
        chunks: list[str] = []
        for page in reader.pages:
            chunks.append(page.extract_text() or "")
        return "\n".join(chunks).strip()
    except Exception:
        return ""


def extract_document_text(*, content: bytes, filename: str, content_type: str | None) -> str:
    name = (filename or "").lower()
    kind = (content_type or "").lower()

    if name.endswith(".pdf") or "pdf" in kind:
        return _extract_pdf_text(content)

    for encoding in ("utf-8", "latin-1"):
        try:
            return content.decode(encoding).strip()
        except UnicodeDecodeError:
            continue

    return ""
