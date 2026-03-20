from __future__ import annotations

import re

from ai.agents.orchestrator.gemini_orchestrator import GeminiOrchestratorError, evaluate_with_gemini
from ai.models.recruitment import CandidateApplicationPayload, CandidateEvaluationResult, EvaluatedProject
from ai.prompts.recruitment.candidate_evaluation import build_candidate_evaluation_prompt


def _tokenize(text: str) -> set[str]:
    stop_words = {
        "the",
        "and",
        "for",
        "with",
        "from",
        "that",
        "this",
        "have",
        "has",
        "your",
        "years",
        "year",
        "must",
        "will",
        "are",
        "you",
        "our",
    }
    tokens = {tok for tok in re.findall(r"[a-zA-Z0-9+#.]{3,}", text.lower()) if tok not in stop_words}
    return tokens


def _extract_urls(text: str) -> list[str]:
    urls = re.findall(r"https?://[^\s)\]>\"']+", text, flags=re.IGNORECASE)
    cleaned: list[str] = []
    seen: set[str] = set()
    for url in urls:
        normalized = url.rstrip(".,;)")
        key = normalized.lower().rstrip("/")
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(normalized)
    return cleaned


def _classify_links(urls: list[str]) -> tuple[str | None, str | None, str | None, list[str]]:
    linkedin = next((u for u in urls if "linkedin.com" in u.lower()), None)
    github = next((u for u in urls if "github.com" in u.lower()), None)
    excluded = {"linkedin.com", "github.com", "mailto:", "tel:"}
    project_urls: list[str] = []
    for url in urls:
        low = url.lower()
        if any(token in low for token in excluded):
            continue
        project_urls.append(url)
    portfolio = project_urls[0] if project_urls else None
    return linkedin, github, portfolio, project_urls[:8]


def _fallback_evaluation(payload: CandidateApplicationPayload) -> CandidateEvaluationResult:
    jd_tokens = _tokenize(f"{payload.job_title} {payload.jd_text}")
    candidate_text = " ".join(
        [
            payload.professional_summary,
            payload.total_experience,
            payload.education,
            payload.resume_text,
            payload.current_company,
        ]
    )
    candidate_tokens = _tokenize(candidate_text)

    overlap = len(jd_tokens & candidate_tokens)
    denominator = max(len(jd_tokens), 1)
    overlap_ratio = overlap / denominator
    ats_score = int(min(100, max(20, round(overlap_ratio * 100))))
    suitability = int(min(100, max(20, round((ats_score + payload.required_ats) / 2))))

    summary = payload.professional_summary.strip()
    if not summary:
        summary = (
            f"Candidate applied for {payload.job_title} with {payload.total_experience or 'unspecified'} "
            "experience and submitted resume for ATS screening."
        )

    experience_summary = payload.total_experience.strip() or "Experience details not explicitly provided."

    known_tech = [
        "react",
        "next.js",
        "typescript",
        "javascript",
        "python",
        "fastapi",
        "django",
        "flask",
        "node",
        "express",
        "postgresql",
        "mysql",
        "mongodb",
        "docker",
        "aws",
        "tailwind",
    ]

    extracted_skills = [
        tech.upper() if len(tech) <= 4 else tech.title()
        for tech in known_tech
        if tech in candidate_text.lower()
    ][:12]

    resume_lines = [line.strip() for line in payload.resume_text.splitlines() if line.strip()]
    all_detected_urls = _extract_urls("\n".join([payload.resume_text, payload.professional_summary]))
    linkedin_url, github_url, portfolio_url, project_urls = _classify_links(all_detected_urls)

    if payload.linkedin_url and payload.linkedin_url.strip():
        linkedin_url = payload.linkedin_url.strip()
    if payload.portfolio_url and payload.portfolio_url.strip():
        portfolio_url = payload.portfolio_url.strip()

    candidate_project_lines = [line for line in resume_lines if "project" in line.lower()][:3]
    fallback_projects: list[EvaluatedProject] = []
    for index, line in enumerate(candidate_project_lines, start=1):
        tech_stack = [tech for tech in known_tech if tech in line.lower()][:5]
        link = project_urls[index - 1] if index - 1 < len(project_urls) else None
        fallback_projects.append(
            EvaluatedProject(
                name=f"Project {index}",
                techStack=[tech.upper() if len(tech) <= 4 else tech.title() for tech in tech_stack],
                impact=line[:220],
                link=link,
            )
        )

    return CandidateEvaluationResult(
        ats_score=ats_score,
        suitability=suitability,
        extracted_skills=extracted_skills,
        certifications=[],
        achievements=[],
        projects=fallback_projects,
        linkedin_url=linkedin_url,
        github_url=github_url,
        portfolio_url=portfolio_url,
        project_urls=project_urls,
        professional_summary=summary,
        experience_summary=experience_summary,
    )


def evaluate_candidate_application(payload: CandidateApplicationPayload) -> CandidateEvaluationResult:
    prompt = build_candidate_evaluation_prompt(payload)
    try:
        return evaluate_with_gemini(prompt)
    except GeminiOrchestratorError:
        return _fallback_evaluation(payload)
