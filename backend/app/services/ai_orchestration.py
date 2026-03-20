from __future__ import annotations

import asyncio
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
if str(REPO_ROOT) not in sys.path:
    sys.path.append(str(REPO_ROOT))

from ai.models.recruitment import CandidateApplicationPayload, CandidateEvaluationResult  # noqa: E402
from ai.pipelines.application_evaluation import evaluate_candidate_application  # noqa: E402
from ai.pipelines.text_extraction import extract_document_text  # noqa: E402


def extract_text_from_uploaded_document(*, content: bytes, filename: str, content_type: str | None) -> str:
    return extract_document_text(content=content, filename=filename, content_type=content_type)


async def run_candidate_application_ai(payload: CandidateApplicationPayload) -> CandidateEvaluationResult:
    return await asyncio.to_thread(evaluate_candidate_application, payload)
