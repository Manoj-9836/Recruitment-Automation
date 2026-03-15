# AI Team – Todo List
## Project: AI Hiring Assistant

## Locked Tech Stack
- [ ] Python for all AI services and agents
- [ ] FastAPI-compatible service interfaces for backend integration
- [ ] Managed PostgreSQL (e.g., Supabase, Neon, Azure Database for PostgreSQL, or Google Cloud SQL)-backed metadata and result persistence via backend APIs
- [ ] Object storage (e.g., Cloudflare R2, Google Cloud Storage, Azure Blob Storage, or MinIO)-sourced documents and transcripts via backend APIs

---

## Phase 1 – Setup & Infrastructure

### [ ] 1.1 LLM Provider Setup
- [ ] Select and configure primary LLM provider (e.g., OpenAI GPT-4o, Anthropic Claude, or Azure OpenAI)
- [ ] Set up API key management and secure secret storage
- [ ] Implement LLM client wrapper with retry logic, rate limit handling, and timeout management
- [ ] Configure fallback provider if primary is unavailable

### [ ] 1.2 Framework & Tooling
- [ ] Set up LangChain as orchestration framework
- [ ] Set up vector database for semantic search (e.g., Pinecone, Chroma, or pgvector)
- [ ] Set up prompt registry for versioned prompt management
- [ ] Configure structured output parsing (Pydantic output parsers)
- [ ] Set up async execution support for all agents

### [ ] 1.3 Shared Utilities
- [ ] Build shared text chunking and preprocessing utilities
- [ ] Build token counting and truncation utility
- [ ] Build structured output validator
- [ ] Write logging wrapper for all LLM calls (input, output, latency, tokens used)

---

## Phase 2 – Resume Analysis Agent

**Location:** `ai/agents/resume_analysis/`

### [ ] 2.1 Resume Parsing Integration
- [ ] Accept structured parsed resume text from backend document processing engine
- [ ] Normalize and prepare input for LLM analysis

### [ ] 2.2 JD Matching
- [ ] Extract key requirements from structured JD input
- [ ] Score resume against JD requirements (skill match, experience match, role relevance)
- [ ] Identify strengths aligned with JD
- [ ] Identify gaps and missing qualifications

### [ ] 2.3 Benchmark Comparison (Optional Reference Resume)
- [ ] Compare candidate profile against ideal reference resume if provided
- [ ] Generate comparative insights (above/below benchmark)

### [ ] 2.4 Output
- [ ] Generate resume fit score (0–100)
- [ ] Return structured output: strengths, gaps, relevance summary, score, confidence
- [ ] Write Pydantic output schema for resume analysis result
- [ ] Write prompt(s) in `ai/prompts/resume/`

---

## Phase 3 – Interview Question Generator Agent

**Location:** `ai/agents/interview_question_generator/`

### [ ] 3.1 Question Generation
- [ ] Accept structured JD and candidate profile as inputs
- [ ] Generate role-specific technical questions tailored to the job
- [ ] Generate behavioral questions based on core competencies
- [ ] Adjust depth and complexity based on seniority level

### [ ] 3.2 Ideal Answer Guidance
- [ ] For each question, generate a guidance note describing ideal answer characteristics
- [ ] Include key points an evaluator should listen for

### [ ] 3.3 Output
- [ ] Return list of structured question objects: question text, type (technical/behavioral), ideal answer guidance
- [ ] Write Pydantic output schema for question set
- [ ] Write prompt(s) in `ai/prompts/interview/`

---

## Phase 4 – Interview Transcript Evaluation Agent

**Location:** `ai/agents/transcript_evaluation/`

### [ ] 4.1 Transcript Preprocessing
- [ ] Accept normalized interview transcript (speaker-labeled turns)
- [ ] Filter out noise (filler words, off-topic exchanges)

### [ ] 4.2 Evaluation Logic
- [ ] Assess depth of understanding per answer
- [ ] Assess relevance of responses to questions asked
- [ ] Evaluate communication clarity (structure, conciseness, vocabulary)
- [ ] Detect signs of AI-generated phrasing in responses (carry over from Risk Agent)

### [ ] 4.3 Output
- [ ] Generate interview performance score (0–100)
- [ ] Return structured summary insights per answer
- [ ] Provide overall strengths and weaknesses in communication
- [ ] Suggest follow-up questions for the next interview round
- [ ] Write Pydantic output schema for transcript evaluation result
- [ ] Write prompt(s) in `ai/prompts/interview/`

---

## Phase 5 – Coding Evaluation Agent

**Location:** `ai/agents/coding_evaluation/`

### [ ] 5.1 Evaluation Logic
- [ ] Accept coding challenge prompt and candidate's text-based answer
- [ ] Evaluate logical correctness of the approach
- [ ] Evaluate code structure and readability
- [ ] Evaluate edge case awareness
- [ ] Evaluate heuristic correctness (since no execution environment exists)

### [ ] 5.2 Output
- [ ] Generate coding score (0–100)
- [ ] Return structured feedback: logical approach rating, structure rating, edge case rating, correctness rating
- [ ] Produce plain-language feedback summary for recruiter/hiring manager
- [ ] Write Pydantic output schema for coding evaluation result
- [ ] Write prompt(s) in `ai/prompts/coding/`

---

## Phase 6 – AI Interview Conductor Agent

**Location:** `ai/agents/interview_conductor/`

### [ ] 6.1 Adaptive Chat Interview Engine
- [ ] Accept job role, JD, and candidate profile as context
- [ ] Generate structured opening message to candidate
- [ ] Generate contextually relevant follow-up questions based on each candidate response
- [ ] Adjust question depth dynamically (probe deeper on weak answers, advance on strong answers)
- [ ] Enforce interview flow: introduction → technical → behavioral → closing

### [ ] 6.2 Session Management
- [ ] Maintain conversation history within the session
- [ ] Detect interview completion criteria (minimum question coverage reached)
- [ ] Gracefully close the interview session

### [ ] 6.3 Transcript Generation
- [ ] Compile full structured transcript from session history
- [ ] Format transcript in standardized speaker-labeled format
- [ ] Pass transcript to Transcript Evaluation Agent automatically at conclusion

### [ ] 6.4 Output
- [ ] Return complete structured transcript
- [ ] Write Pydantic schema for conductor session and transcript output
- [ ] Write prompt(s) in `ai/prompts/interview/`

---

## Phase 7 – Risk & AI Usage Detection Agent

**Location:** `ai/agents/risk_detection/`

### [ ] 7.1 Resume Consistency Analysis
- [ ] Analyze consistency of dates, roles, and progressions within the resume
- [ ] Flag logical gaps or inconsistencies in employment history
- [ ] Flag skill claims that seem inconsistent with stated experience level

### [ ] 7.2 AI-Generated Content Detection
- [ ] Analyze linguistic patterns in resume text for AI-generated writing signals
- [ ] Analyze transcript responses for AI-generated answer patterns (overly structured, generic phrasing, lack of personal anecdotes)
- [ ] Generate AI usage likelihood score and indicator label: Low / Medium / High

### [ ] 7.3 Output
- [ ] Return structured risk report: consistency flags, AI usage likelihood, risk summary
- [ ] Write Pydantic output schema for risk analysis result
- [ ] Write prompt(s) in `ai/prompts/risk/`

---

## Phase 8 – Orchestrator Layer

**Location:** `ai/agents/orchestrator/`

### [ ] 8.1 Workflow Coordination
- [ ] Design and implement the end-to-end hiring workflow state machine
  - Step 1: Resume Analysis → store result
  - Step 2: Risk Analysis → store result
  - Step 3: Question Generation → store result
  - Step 4: Coding Evaluation (if submission exists) → store result
  - Step 5: Transcript Evaluation (if transcript exists) → store result
  - Step 6: Final score aggregation
- [ ] Trigger agents asynchronously where steps are independent
- [ ] Handle partial pipeline runs (e.g., transcript not yet available)

### [ ] 8.2 Weighted Score Aggregation
- [ ] Pull scoring weights from job-level scoring config
- [ ] Compute weighted composite score for each candidate
- [ ] Normalize scores to consistent 0–100 scale

### [ ] 8.3 Consolidated Candidate Report
- [ ] Aggregate all agent outputs into a single structured evaluation object
- [ ] Include: resume fit score, risk summary, question set, coding score, interview score, composite score, narrative summary
- [ ] Pass consolidated result to backend for storage and report generation

### [ ] 8.4 Error Handling
- [ ] Handle individual agent failures gracefully without failing the full pipeline
- [ ] Log agent errors with full context for debugging
- [ ] Retry failed agent calls with exponential backoff

---

## Phase 9 – Prompt Engineering

**Location:** `ai/prompts/`

### [ ] 9.1 Prompt Development
- [ ] Write and version all prompts for each agent using a consistent template format
- [ ] Include system prompt, context injection points, and output format instructions in each prompt
- [ ] Use structured output instructions (JSON mode or function calling where available)

### [ ] 9.2 Prompt Versioning
- [ ] Maintain version history for each prompt file
- [ ] Document what changed between prompt versions and why

### [ ] 9.3 Prompt Tuning Workflow
- [ ] Define a structured process for prompt refinement based on client sample outputs
- [ ] Collect sample resumes, transcripts, and coding answers from client for calibration
- [ ] Iterate on prompts based on SME review feedback

---

## Phase 10 – Evaluation & Testing

**Location:** `ai/evaluation/` and `ai/tests/`

### [ ] 10.1 Test Dataset Preparation
- [ ] Collect and anonymize sample resumes (minimum 10–20)
- [ ] Collect sample interview transcripts (minimum 5–10)
- [ ] Collect sample coding submissions (minimum 5–10)
- [ ] Define ground-truth quality labels or expected score ranges per sample

### [ ] 10.2 Agent-Level Evaluation
- [ ] Evaluate Resume Analysis Agent accuracy against ground-truth labels
- [ ] Evaluate Interview Transcript Evaluation Agent score alignment
- [ ] Evaluate Coding Evaluation Agent score alignment
- [ ] Evaluate Risk Agent flag accuracy
- [ ] Evaluate AI Interview Conductor coherence and coverage

### [ ] 10.3 Benchmarking & Reporting
- [ ] Track score distribution across sample set
- [ ] Measure token usage and latency per agent per run
- [ ] Produce evaluation report summarizing accuracy and areas for improvement

### [ ] 10.4 Regression Testing
- [ ] Build automated regression test suite using fixed sample inputs and expected outputs
- [ ] Run regression tests on every prompt or model change
- [ ] Fail CI pipeline on significant score deviation from baseline

---

## Phase 11 – Integration with Backend

### [ ] 11.1 API Integration Points
- [ ] Define input/output contracts between AI agents and backend API (schemas in `shared/schemas/`)
- [ ] Implement AI module as a callable service or worker (Celery task, FastAPI background task, or separate microservice)
- [ ] Expose internal endpoints or task hooks for backend to trigger each agent
- [ ] Accept object storage keys and signed access URLs from backend for document retrieval context

### [ ] 11.2 Storage of Results
- [ ] Ensure all agent outputs are serialized to JSON and returned to backend for persistence
- [ ] Handle large outputs gracefully (chunking or summarization if needed)

### [ ] 11.3 Teams Integration (Interview Conductor)
- [ ] Investigate Microsoft Teams API or Bot Framework for real-time transcript access
- [ ] Implement AI participant/bot that joins calls and captures transcript in real time
- [ ] Pipe real-time transcript chunks to Transcript Evaluation Agent
