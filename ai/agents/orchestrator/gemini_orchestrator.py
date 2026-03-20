from __future__ import annotations

import json
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from ai.config import get_gemini_api_key, get_gemini_model
from ai.models.recruitment import CandidateEvaluationResult, EvaluatedProject


class GeminiOrchestratorError(RuntimeError):
    pass


def _extract_json_block(text: str) -> str:
    text = text.strip()
    if text.startswith("{") and text.endswith("}"):
        return text

    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        raise GeminiOrchestratorError("Gemini response did not contain JSON")
    return match.group(0)


def _normalize_result(raw: dict) -> CandidateEvaluationResult:
    normalized_projects: list[EvaluatedProject] = []
    for index, item in enumerate(raw.get("projects", []), start=1):
        if not isinstance(item, dict):
            continue

        name = str(item.get("name") or item.get("title") or f"Project {index}").strip()
        impact = str(item.get("impact") or item.get("description") or "Project impact not specified.").strip()
        link_value = item.get("link") or item.get("url")
        link = str(link_value).strip() if link_value else None

        tech_raw = item.get("techStack") or item.get("technologies") or item.get("stack") or []
        if isinstance(tech_raw, str):
            tech_stack = [tok.strip() for tok in re.split(r",|/|\|", tech_raw) if tok.strip()]
        elif isinstance(tech_raw, list):
            tech_stack = [str(tok).strip() for tok in tech_raw if str(tok).strip()]
        else:
            tech_stack = []

        normalized_projects.append(
            EvaluatedProject(
                name=name,
                techStack=tech_stack[:10],
                impact=impact,
                link=link,
            )
        )

    raw_project_urls = raw.get("project_urls", [])
    if isinstance(raw_project_urls, str):
        normalized_project_urls = [u.strip() for u in re.split(r",|\n", raw_project_urls) if u.strip()]
    elif isinstance(raw_project_urls, list):
        normalized_project_urls = [str(u).strip() for u in raw_project_urls if str(u).strip()]
    else:
        normalized_project_urls = []

    for project in normalized_projects:
        if project.link:
            normalized_project_urls.append(project.link)

    deduped_project_urls: list[str] = []
    seen_urls: set[str] = set()
    for url in normalized_project_urls:
        key = url.lower().rstrip("/")
        if key in seen_urls:
            continue
        seen_urls.add(key)
        deduped_project_urls.append(url)

    linkedin_url = raw.get("linkedin_url")
    github_url = raw.get("github_url")
    portfolio_url = raw.get("portfolio_url")

    return CandidateEvaluationResult(
        ats_score=int(raw.get("ats_score", 0)),
        suitability=int(raw.get("suitability", raw.get("ats_score", 0))),
        extracted_skills=[str(item).strip() for item in raw.get("extracted_skills", []) if str(item).strip()],
        certifications=[str(item).strip() for item in raw.get("certifications", []) if str(item).strip()],
        achievements=[str(item).strip() for item in raw.get("achievements", []) if str(item).strip()],
        projects=normalized_projects,
        linkedin_url=str(linkedin_url).strip() if linkedin_url else None,
        github_url=str(github_url).strip() if github_url else None,
        portfolio_url=str(portfolio_url).strip() if portfolio_url else None,
        project_urls=deduped_project_urls[:8],
        professional_summary=str(raw.get("professional_summary", "")).strip(),
        experience_summary=str(raw.get("experience_summary", "")).strip(),
    )


def evaluate_with_gemini(prompt: str) -> CandidateEvaluationResult:
    api_key = get_gemini_api_key()
    if not api_key:
        raise GeminiOrchestratorError("GEMINI_API_KEY is not configured")

    model = get_gemini_model()
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }

    request = Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
    except TimeoutError as exc:
        raise GeminiOrchestratorError(f"Gemini API request timed out after 30 seconds") from exc
    except HTTPError as exc:
        details = exc.read().decode("utf-8", errors="ignore")
        raise GeminiOrchestratorError(f"Gemini HTTP error: {exc.code} {details}") from exc
    except URLError as exc:
        raise GeminiOrchestratorError(f"Gemini network error: {exc.reason}") from exc

    response_json = json.loads(body)
    candidates = response_json.get("candidates", [])
    if not candidates:
        raise GeminiOrchestratorError("Gemini returned no candidates")

    parts = candidates[0].get("content", {}).get("parts", [])
    text_parts = [str(part.get("text", "")) for part in parts if part.get("text")]
    if not text_parts:
        raise GeminiOrchestratorError("Gemini returned empty content")

    raw_text = "\n".join(text_parts)
    result_json = json.loads(_extract_json_block(raw_text))
    return _normalize_result(result_json)
