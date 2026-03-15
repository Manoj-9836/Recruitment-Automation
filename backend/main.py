from __future__ import annotations

import os
import sys
from pathlib import Path


def _venv_python_path() -> Path:
    root = Path(__file__).resolve().parent
    if os.name == "nt":
        return root / ".venv" / "Scripts" / "python.exe"
    return root / ".venv" / "bin" / "python"


def _ensure_venv_interpreter() -> None:
    venv_python = _venv_python_path()
    current_python = Path(sys.executable).resolve()

    if not venv_python.exists() or current_python == venv_python.resolve():
        return

    os.execv(
        str(venv_python),
        [
            str(venv_python),
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "0.0.0.0",
            "--port",
            "8000",
            "--reload",
        ],
    )


if __name__ == "__main__":
    _ensure_venv_interpreter()
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
