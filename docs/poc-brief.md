# Recruitment Automation POC Brief

## 1) POC Objective
Validate that the platform can process candidate resumes and produce an explainable shortlist for HR review, fast enough for practical hiring decisions.

## 2) Problem Statement
Recruiters spend too much time manually screening resumes and aligning candidates to job requirements.
This POC proves that AI-assisted screening can reduce time-to-shortlist while preserving transparency.

## 3) In-Scope (POC)
- Resume intake from a defined sample dataset.
- Resume parsing and candidate profile extraction.
- AI-based candidate evaluation against a target role.
- Ranked shortlist output (top candidates) with explanation fields.
- HR dashboard view for shortlist and rationale.
- End-to-end demo flow from upload to shortlist.

## 4) Out of Scope (Phase 2)
- Production-grade security hardening and compliance audit.
- Full ATS, SSO, and enterprise integration coverage.
- Advanced role-based access control and audit trails.
- Final UX polish and extensive cross-browser optimization.
- Full production load/performance testing.

## 5) Success Criteria (POC Acceptance)
- Process at least 20 resumes from the agreed sample set.
- Return top 5-10 ranked candidates for a selected role.
- Show clear evaluation rationale per candidate (skills match, experience relevance, risk flags if configured).
- End-to-end run completes within agreed demo thresholds.
- Client stakeholders confirm output is decision-useful.

## 6) Data and Assumptions
- Client provides anonymized sample resumes and one target job description.
- English-language documents for POC phase.
- Scoring is advisory, not a final hiring decision engine.
- POC environment may use controlled test credentials and test data only.

## 7) Delivery Plan (7 Working Days)
- Day 1: Scope lock, sample data validation, acceptance criteria sign-off.
- Day 2-3: Configure pipeline for intake, extraction, and evaluation.
- Day 4-5: Build/verify shortlist output and dashboard walkthrough flow.
- Day 6: Internal dry run, bug fixes, demo script finalization.
- Day 7: Client demo, feedback capture, go/no-go for Phase 2.

## 8) Key Risks and Mitigations
- Inconsistent resume formats -> use constrained test set first, then expand.
- Ambiguous job requirements -> require one finalized JD for benchmark.
- Expectation mismatch on "production-ready" -> enforce in-scope/out-of-scope agreement before build.
- Data sensitivity concerns -> use anonymized or synthetic data in POC.

## 9) Client Inputs Required
- One approved job description for benchmark scoring.
- 20-50 anonymized sample resumes.
- Named approver(s) for POC sign-off.
- Preferred demo date/time and attendees.

## 10) Sign-off Checklist
- Scope approved.
- Success criteria approved.
- Input data received and validated.
- Demo scenario approved.
- Decision owners identified.

## 11) Ready-to-Send Client Message
For the POC, we will prove one complete recruitment flow end-to-end: resume intake -> AI evaluation -> ranked shortlist with rationale in dashboard.

Success will be measured against agreed criteria (sample size, shortlist quality, explanation clarity, and demo performance threshold).

This POC validates feasibility and business value quickly. Production-grade hardening, broad integrations, and advanced controls are intentionally planned for Phase 2 after sign-off.

Please confirm:
1. Benchmark job description
2. Sample resumes (anonymized)
3. Approver names
4. Target demo date
