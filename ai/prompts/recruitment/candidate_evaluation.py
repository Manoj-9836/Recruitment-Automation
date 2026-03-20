from __future__ import annotations

import json

from ai.models.recruitment import CandidateApplicationPayload


def build_candidate_evaluation_prompt(payload: CandidateApplicationPayload) -> str:
    output_schema = {
        "ats_score": "number",
        "suitability": "number",
        "extracted_skills": ["string"],
        "certifications": ["string"],
        "achievements": ["string"],
        "linkedin_url": "string|null",
        "github_url": "string|null",
        "portfolio_url": "string|null",
        "project_urls": ["string"],
        "projects": [
            {
                "name": "string",
                "techStack": ["string"],
                "impact": "string",
                "link": "string|null",
            }
        ],
        "professional_summary": "string",
        "experience_summary": "string",
    }

    sections = [
        "You are an expert ATS and hiring analyst.",
        "Evaluate the candidate against the given Job Description and application details.",
        "",
        "Rules:",
        "1) Return valid JSON only. No markdown.",
        "2) Keep ats_score and suitability between 0 and 100.",
        "3) extracted_skills, certifications, achievements must be arrays of short strings.",
        "4) projects must be an array with up to 4 strongest resume projects.",
        "5) Each project must include name, techStack (array), impact, and optional link.",
        "6) Extract links when present: linkedin_url, github_url, portfolio_url, and project_urls.",
        "7) professional_summary and experience_summary must be concise.",
        "8) Prioritize JD alignment, required skills, years of experience, and evidence from resume/application.",
        "",
        "Output schema:",
        json.dumps(output_schema, indent=2),
        "",
        "Job Title:",
        payload.job_title,
        "",
        "Required ATS threshold:",
        str(payload.required_ats),
        "",
        "Job Description text:",
        payload.jd_text,
        "",
        "Candidate profile:",
        f"- Name: {payload.candidate_name}",
        f"- Email: {payload.email}",
        f"- Phone: {payload.phone}",
        f"- Location: {payload.location}",
        f"- Total Experience: {payload.total_experience}",
        f"- Current Company: {payload.current_company}",
        f"- LinkedIn: {payload.linkedin_url}",
        f"- Portfolio: {payload.portfolio_url}",
        f"- Education: {payload.education}",
        f"- Professional Summary: {payload.professional_summary}",
        "",
        "Resume extracted text:",
        payload.resume_text,
    ]
    return "\n".join(sections).strip()
