from __future__ import annotations

import mimetypes
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

from app.core.config import get_settings


def _ensure_configured() -> tuple[str, str]:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
    return settings.supabase_url.rstrip("/"), settings.supabase_service_role_key


def _upload_bytes_local(*, bucket: str, destination_path: str, content: bytes) -> str:
    settings = get_settings()
    normalized_path = destination_path.strip("/")
    local_root = Path(settings.local_upload_dir)
    target_path = local_root / bucket / normalized_path
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_bytes(content)

    encoded_path = quote(normalized_path)
    return f"{settings.backend_base_url.rstrip('/')}/uploads/{bucket}/{encoded_path}"


def upload_bytes(*, bucket: str, destination_path: str, content: bytes, content_type: str | None = None) -> str:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        return _upload_bytes_local(bucket=bucket, destination_path=destination_path, content=content)

    supabase_url, service_role_key = _ensure_configured()
    normalized_path = destination_path.strip("/")
    encoded_path = quote(normalized_path)
    url = f"{supabase_url}/storage/v1/object/{bucket}/{encoded_path}"

    guessed = content_type or mimetypes.guess_type(normalized_path)[0] or "application/octet-stream"

    request = Request(
        url=url,
        data=content,
        method="POST",
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "x-upsert": "true",
            "Content-Type": guessed,
        },
    )

    with urlopen(request) as _:
        pass

    return get_public_url(bucket=bucket, destination_path=normalized_path)


def get_public_url(*, bucket: str, destination_path: str) -> str:
    settings = get_settings()
    supabase_url = settings.supabase_url.rstrip("/")
    normalized_path = destination_path.strip("/")
    encoded_path = quote(normalized_path)
    return f"{supabase_url}/storage/v1/object/public/{bucket}/{encoded_path}"


def normalize_filename(file_name: str) -> str:
    candidate = Path(file_name).name.strip().replace(" ", "-")
    return candidate.lower()
