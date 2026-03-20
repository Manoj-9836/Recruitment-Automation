from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        if key and key not in os.environ:
            os.environ[key] = value


@lru_cache
def load_ai_environment() -> None:
    ai_root = Path(__file__).resolve().parent
    _load_env_file(ai_root / ".env")


def get_gemini_model() -> str:
    load_ai_environment()
    return os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def get_gemini_api_key() -> str:
    load_ai_environment()
    return os.getenv("GEMINI_API_KEY", "").strip()
