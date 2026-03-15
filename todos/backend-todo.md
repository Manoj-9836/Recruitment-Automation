# Backend Team – Todo List
## Project: AI Hiring Assistant

## Locked Tech Stack
- [x] Python + FastAPI
- [x] Supabase PostgreSQL
- [ ] Amazon S3 for resume and document storage

---

## Phase 1 – Setup & Foundation

### [x] 1.1 Project Initialization
- [x] Initialize FastAPI project under `backend/`
- [x] Set up virtual environment and `requirements.txt` / `pyproject.toml`
- [x] Configure environment variable management using `pydantic-settings`
- [x] Set up structured logging using `structlog`
- [x] Configure CORS middleware for frontend origin
- [x] Set up application entrypoint and app factory pattern

### [ ] 1.2 Database Setup
- [x] Install and configure PostgreSQL connection (Supabase endpoint)
- [x] Set up SQLAlchemy async ORM
- [x] Set up Alembic for database migrations
- [x] Create initial migration for baseline schema
- [x] Write database session dependency for injection into routes
- [ ] Configure Supabase automated backups and define restore runbook

### [x] 1.3 Project Structure Wiring
- [x] Wire up APIRouter across all `v1/` sub-modules
- [x] Set up unified error handling and standardized JSON error responses
- [x] Set up health check endpoint (`GET /health`)
- [x] Set up request validation using Pydantic v2 schemas

---

## Phase 2 – Authentication & Authorization

### [ ] 2.1 User Authentication
- [ ] Implement user registration endpoint
- [ ] Implement login endpoint returning JWT access token
- [ ] Implement logout (token invalidation or client-side clearing)
- [ ] Hash passwords using bcrypt
- [ ] Validate credentials securely

### [ ] 2.2 JWT Token Management
- [ ] Generate signed JWT tokens with expiry
- [ ] Implement token verification middleware / dependency
- [ ] Implement refresh token mechanism (if in scope)
- [ ] Return standardized auth error responses (401, 403)

### [ ] 2.3 Role-Based Access Control (RBAC)
- [ ] Define roles: Admin, Recruiter, Hiring Manager
- [ ] Implement role permission matrix
- [ ] Build reusable permission dependency for route-level enforcement
- [ ] Apply RBAC guards to all protected routes

---

## Phase 3 – User Management API

### [ ] 3.1 User CRUD
- [ ] `POST /users` – Create user (Admin only)
- [ ] `GET /users` – List users (Admin only)
- [ ] `GET /users/{id}` – Get user detail
- [ ] `PUT /users/{id}` – Update user
- [ ] `DELETE /users/{id}` – Deactivate user (Admin only)

### [ ] 3.2 Role Assignment
- [ ] `PUT /users/{id}/role` – Assign or change user role (Admin only)

---

## Phase 4 – Project & Job Management API

### [ ] 4.1 Project Endpoints
- [ ] `POST /projects` – Create a new project
- [ ] `GET /projects` – List all projects
- [ ] `GET /projects/{id}` – Get project details
- [ ] `PUT /projects/{id}` – Update project

### [ ] 4.2 Job Role Endpoints
- [ ] `POST /jobs` – Create new job role under a project
- [ ] `GET /jobs` – List job roles with filters (active/closed, project)
- [ ] `GET /jobs/{id}` – Get job role details
- [ ] `PUT /jobs/{id}` – Update job role (title, description, status)
- [ ] `PUT /jobs/{id}/activate` – Activate job role
- [ ] `PUT /jobs/{id}/close` – Close job role

### [ ] 4.3 Job Description Upload
- [ ] `POST /jobs/{id}/jd` – Upload JD file (PDF, up to 10 files)
- [ ] Integrate with document processing engine for parsing
- [ ] Store parsed structured JD data

### [ ] 4.4 Reference Resume Upload
- [ ] `POST /jobs/{id}/reference-resume` – Upload ideal candidate resume
- [ ] Parse and store structured reference profile

### [ ] 4.5 Scoring Configuration
- [ ] `PUT /jobs/{id}/scoring-config` – Save scoring weights per job role
- [ ] `GET /jobs/{id}/scoring-config` – Retrieve scoring config

---

## Phase 5 – Candidate Management API

### [ ] 5.1 Candidate Upload & Profile
- [ ] `POST /jobs/{id}/candidates` – Upload candidate resume (PDF or text)
- [ ] Trigger async document processing pipeline on upload
- [ ] Upload raw files to AWS S3 and persist object key metadata in PostgreSQL
- [ ] Generate S3 pre-signed upload URLs and validate object metadata after upload
- [ ] `GET /jobs/{id}/candidates` – List candidates for a job
- [ ] `GET /candidates/{id}` – Get full candidate profile with evaluation data
- [ ] `PUT /candidates/{id}` – Update candidate metadata

### [ ] 5.2 Candidate Lifecycle Actions
- [ ] `PUT /candidates/{id}/shortlist` – Mark candidate as shortlisted
- [ ] `PUT /candidates/{id}/reject` – Mark candidate as rejected
- [ ] Store and retrieve lifecycle status per stage

### [ ] 5.3 Activity Log
- [ ] Log every action taken on a candidate (upload, shortlist, reject, evaluate)
- [ ] `GET /candidates/{id}/activity` – Retrieve candidate activity timeline

---

## Phase 6 – Document Processing Engine

### [ ] 6.1 Resume Parser
- [ ] Implement PDF text extraction using PyMuPDF
- [ ] Implement text resume ingestion
- [ ] Normalize and clean extracted text
- [ ] Extract structured fields: name, contact, experience, education, skills
- [ ] Output to predefined Pydantic schema

### [ ] 6.2 Job Description Parser
- [ ] Extract key requirements, responsibilities, and qualifications from JD text
- [ ] Handle multi-PDF JD by merging parsed content
- [ ] Output to structured JD schema

### [ ] 6.3 Transcript Ingestion
- [ ] Parse uploaded interview transcript files
- [ ] Handle Teams transcript format
- [ ] Normalize speaker turns and timestamps

### [ ] 6.4 Coding Submission Ingestion
- [ ] Accept and store plain-text coding answers
- [ ] Tag with candidate, job, and challenge metadata

### [ ] 6.5 Parallel Processing
- [ ] Implement async background task queue (Celery + Redis)
- [ ] Process multiple document uploads concurrently
- [ ] Implement retry logic for failed processing jobs

### [ ] 6.6 Metadata & Versioning
- [ ] Tag each document with upload timestamp, uploader, version number
- [ ] Version-track updated documents (re-uploads)

---

## Phase 7 – Interview API

### [ ] 7.1 Transcript Upload
- [ ] `POST /candidates/{id}/transcripts` – Upload interview transcript
- [ ] Return parsed transcript data and trigger AI evaluation

### [ ] 7.2 Interview Scheduling
- [ ] `POST /interviews` – Schedule an interview
- [ ] `GET /interviews` – List scheduled interviews
- [ ] `GET /interviews/{id}` – Get interview detail
- [ ] `PUT /interviews/{id}/confirm` – Confirm interview
- [ ] `PUT /interviews/{id}/cancel` – Cancel interview
- [ ] `PUT /interviews/{id}/reschedule` – Reschedule interview

---

## Phase 8 – Coding Evaluation API

### [ ] 8.1 Question Bank
- [ ] `POST /coding-challenges` – Add a coding challenge (Admin)
- [ ] `GET /coding-challenges` – List challenges with filters
- [ ] `GET /coding-challenges/{id}` – Get challenge detail

### [ ] 8.2 Submission
- [ ] `POST /candidates/{id}/coding-submissions` – Submit coding answer
- [ ] Trigger AI coding evaluation agent
- [ ] Store evaluation result linked to submission

### [ ] 8.3 Results
- [ ] `GET /candidates/{id}/coding-submissions` – Get submissions and scores

---

## Phase 9 – Reporting API

### [ ] 9.1 Consolidated Candidate Report
- [ ] `GET /candidates/{id}/report` – Generate and return full evaluation report data
- [ ] `GET /candidates/{id}/report/pdf` – Export consolidated report as PDF

### [ ] 9.2 Job-Level Summary
- [ ] `GET /jobs/{id}/summary` – Return aggregated metrics: avg resume score, avg interview score, avg coding score, pipeline distribution

### [ ] 9.3 Audit Logs
- [ ] `GET /audit-logs` – Retrieve audit trail (Admin only), filterable by user, candidate, date range

---

## Phase 10 – Data Models & Storage

### [ ] 10.1 Core Database Models
- [ ] `users` – User accounts with roles
- [ ] `projects` – Project definitions
- [ ] `jobs` – Job roles linked to projects
- [ ] `job_descriptions` – JD documents and parsed data
- [ ] `reference_resumes` – Benchmark resumes per job
- [ ] `scoring_configs` – Scoring weights per job
- [ ] `candidates` – Candidate profiles
- [ ] `documents` – Uploaded files with metadata, version, and S3 object key
- [ ] `evaluations` – AI evaluation results per module per candidate
- [ ] `interview_schedules` – Scheduled interviews
- [ ] `interview_transcripts` – Uploaded and AI-generated transcripts
- [ ] `coding_challenges` – Question bank
- [ ] `coding_submissions` – Candidate coding answers and scores
- [ ] `activity_logs` – Candidate activity timeline
- [ ] `audit_logs` – System-wide user action audit trail

### [ ] 10.2 Repository Layer
- [ ] Implement repository class per model for clean data access abstraction
- [ ] Write reusable query helpers (pagination, filters, sorting)

### [ ] 10.3 Data Security
- [ ] Enforce project-level data isolation (candidates scoped to their project)
- [ ] Ensure no cross-project data leakage in queries
- [ ] Apply input sanitization on all user-supplied content to prevent SQL injection

---

## Phase 11 – Production Deployment

### [ ] 11.1 Containerization
- [ ] Write `Dockerfile` for the FastAPI application
- [ ] Write `docker-compose.yml` for local development (app + PostgreSQL + Redis)

### [ ] 11.2 Cloud Deployment
- [ ] Set up cloud hosting on AWS
- [ ] Configure environment secrets management
- [ ] Set up worker process for background task queue
- [ ] Configure S3 bucket policies, IAM roles, and signed URL access for uploads/downloads
- [ ] Configure Amazon RDS parameter groups, security groups, and subnet group

### [ ] 11.3 Infrastructure Monitoring
- [ ] Set up application logging pipeline
- [ ] Integrate error tracking (e.g., Sentry)
- [ ] Configure uptime and performance monitoring
- [ ] Set up database backup mechanism

### [ ] 11.4 Scalability
- [ ] Configure worker concurrency to handle 100+ concurrent users
- [ ] Profile and optimize slow database queries
- [ ] Add database connection pooling tuned for Amazon RDS

---

## Phase 12 – Testing

### [ ] 12.1 Unit Tests
- [ ] Test all service functions and business logic in isolation
- [ ] Test document parsing functions with sample files
- [ ] Test RBAC permission checks

### [ ] 12.2 Integration Tests
- [ ] Test all API endpoints with a test database
- [ ] Test full document upload and processing pipeline
- [ ] Test AI evaluation trigger flow end-to-end (mocked AI responses)

### [ ] 12.3 Performance Tests
- [ ] Load test key endpoints under simulated concurrent users
- [ ] Benchmark document processing throughput
