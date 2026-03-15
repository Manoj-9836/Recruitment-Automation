# Frontend Team – Todo List
## Project: AI Hiring Assistant

## Locked Tech Stack
- [ ] React + TypeScript
- [ ] Vite
- [ ] Tailwind CSS
- [ ] React Router
- [ ] Axios for API calls
- [ ] Amazon S3 pre-signed URL upload/download flow

---

## Phase 1 – Setup & Foundation

### [ ] 1.1 Project Initialization
- [ ] Initialize React + TypeScript project using Vite
- [ ] Install and configure Tailwind CSS (PostCSS + Autoprefixer)
- [ ] Define Tailwind theme tokens (colors, spacing, typography)
- [ ] Configure ESLint, Prettier, and Husky pre-commit hooks
- [ ] Set up folder structure under `src/` (components, pages, hooks, services, store, types, utils)
- [ ] Install and configure a component library (e.g., shadcn/ui, MUI, or Ant Design)
- [ ] Configure environment variable handling (`.env` files per environment)
- [ ] Set up path aliases in tsconfig
- [ ] Configure Vite build tooling for React

### [ ] 1.2 API Client Layer
- [ ] Set up Axios wrapper in `src/services/`
- [ ] Implement request interceptors for JWT token injection
- [ ] Implement response interceptors for error normalization and 401 handling
- [ ] Define typed API response interfaces in `src/types/`

### [ ] 1.3 State Management
- [ ] Set up global state (Zustand or Redux Toolkit)
- [ ] Define store slices: auth, jobs, candidates, interviews, coding, scheduling
- [ ] Set up React Query or SWR for server state and caching

### [ ] 1.4 Routing
- [ ] Configure React Router
- [ ] Define route map for all modules
- [ ] Implement protected route wrapper (redirect unauthenticated users)
- [ ] Implement role-based route guards (Admin, Recruiter, Hiring Manager)

---

## Phase 2 – Authentication & Access Control

### [ ] 2.1 Login & Logout
- [ ] Build login page with email and password fields
- [ ] Implement form validation
- [ ] Integrate login API and store JWT on success
- [ ] Implement logout and token clearance
- [ ] Redirect to dashboard on successful login

### [ ] 2.2 Role-Based Access Control (RBAC)
- [ ] Store user role in auth state after login
- [ ] Implement permission-check hooks (`usePermission`, `useRole`)
- [ ] Conditionally render UI elements based on role (e.g., hide "Upload Candidate" for Hiring Manager)
- [ ] Lock specific pages by role (route-level guard)

### [ ] 2.3 Session Management
- [ ] Implement auto-logout on session timeout (idle timer)
- [ ] Show session expiry warning modal before auto-logout
- [ ] Refresh token flow if token-based refresh is supported by backend

---

## Phase 3 – Dashboard

### [ ] 3.1 Overview Panel
- [ ] Display list of active and closed job roles
- [ ] Show candidate count per job role
- [ ] Display quick-access links to candidate profiles

### [ ] 3.2 Candidate Status Indicators
- [ ] Show per-candidate status chips: Resume Analyzed, Risk Analysis Done, Interview Scheduled, Interview Completed, Coding Evaluated, Final Score Generated

### [ ] 3.3 Summary Metrics per Job
- [ ] Average resume fit score
- [ ] Average interview performance score
- [ ] Average coding score
- [ ] Candidate pipeline distribution (e.g., funnel or bar chart)

---

## Phase 4 – Job Description & Role Configuration Module

### [ ] 4.1 Project & Job Role Creation
- [ ] UI to create a new Project
- [ ] UI to create a Job Role under a Project
- [ ] Form fields: role title, department, seniority level

### [ ] 4.2 Job Description Upload
- [ ] File upload component supporting PDF (up to 10 PDFs)
- [ ] Text input option for manual JD entry
- [ ] Preview uploaded JD content
- [ ] Edit and refine JD after upload

### [ ] 4.3 Reference Resume Upload
- [ ] Upload ideal candidate reference resume (PDF)
- [ ] Display parsed reference profile summary

### [ ] 4.4 Scoring Configuration
- [ ] Configure weight per evaluation area (resume, interview, coding)
- [ ] Save scoring config per job role

### [ ] 4.5 Job Role Lifecycle
- [ ] Activate job role
- [ ] Close job role
- [ ] Status badge display (Active / Closed)

---

## Phase 5 – Candidate Management Module

### [ ] 5.1 Candidate Upload
- [ ] Upload resume in PDF or text format
- [ ] Upload files to Amazon S3 using backend-provided pre-signed URLs
- [ ] Show upload progress and success/error states
- [ ] Trigger automatic parsing flow on upload

### [ ] 5.2 Candidate Profile View
- [ ] Display structured profile header (name, contact, experience summary)
- [ ] Tabbed evaluation view:
  - [ ] Resume Analysis tab
  - [ ] Risk Analysis tab
  - [ ] Interview Analysis tab
  - [ ] Coding Analysis tab
- [ ] Each tab shows AI-generated scores, summaries, and insights

### [ ] 5.3 Candidate Status & Actions
- [ ] Display current lifecycle stage
- [ ] Shortlist candidate action with confirmation
- [ ] Reject candidate action with confirmation
- [ ] Activity timeline showing all actions taken on the candidate

### [ ] 5.4 Evaluation Report Download
- [ ] Button to download consolidated candidate evaluation as PDF
- [ ] Include all tab data in report format
- [ ] Support secure report and document download via time-limited pre-signed URLs

---

## Phase 6 – Interview Transcript Upload & Analysis Module

### [ ] 6.1 Transcript Upload
- [ ] Upload manual transcript (text or document file)
- [ ] Upload transcript file exported from Microsoft Teams
- [ ] Use pre-signed URLs for transcript file upload to Amazon S3

### [ ] 6.2 Evaluation Display
- [ ] Show depth-of-answer analysis
- [ ] Show communication clarity score
- [ ] Show AI usage likelihood indicator
- [ ] Show interview performance score
- [ ] Show structured summary insights
- [ ] Show suggested follow-up questions for next round

---

## Phase 7 – Coding Evaluation Module

### [ ] 7.1 Challenge Selection
- [ ] Display list of available coding challenges from question bank
- [ ] Filter challenges by difficulty or topic

### [ ] 7.2 Candidate Submission Interface
- [ ] Text-based code input area (no execution environment)
- [ ] Submit button with confirmation

### [ ] 7.3 Evaluation Results Display
- [ ] Show logical approach score
- [ ] Show code structure and readability score
- [ ] Show edge case handling score
- [ ] Show heuristic correctness score
- [ ] Show overall coding score
- [ ] Show structured AI feedback summary

---

## Phase 8 – Interview Scheduling

### [ ] 8.1 Schedule Interview
- [ ] Form to schedule interview for a shortlisted candidate
- [ ] Assign interviewer (dropdown from user list)
- [ ] Date and time picker
- [ ] Submit and store schedule

### [ ] 8.2 Status & Confirmation
- [ ] Show scheduled interview status per candidate
- [ ] Manual confirmation workflow (confirm / reschedule / cancel)
- [ ] Status badge updates after confirmation

---

## Phase 9 – Audit & Reporting

### [ ] 9.1 Audit Visibility
- [ ] Basic audit trail view showing user actions per candidate or job
- [ ] Timestamp and actor name per action

### [ ] 9.2 Reports
- [ ] Consolidated per-candidate evaluation report (PDF download)
- [ ] Basic job-level summary report

---

## Phase 10 – UI/UX & Design System

### [ ] 10.1 Design Consistency
- [ ] Define and apply consistent typography, spacing, and color tokens
- [ ] Build reusable common components in `src/components/common/`: Button, Input, Modal, Table, Badge, Tabs, Card, FileUpload, Spinner

### [ ] 10.2 Responsive Layout
- [ ] Ensure all pages are responsive for desktop and tablet
- [ ] Sidebar or top navigation consistent across modules

### [ ] 10.3 Error & Empty States
- [ ] Global error boundary
- [ ] Empty state components for lists and tables
- [ ] Toast/notification system for success and error messages

---

## Phase 11 – Testing

### [ ] 11.1 Unit Tests
- [ ] Write unit tests for all reusable components using Vitest or Jest + React Testing Library
- [ ] Test hooks and utility functions

### [ ] 11.2 Integration Tests
- [ ] Test form submission flows
- [ ] Test route guards and redirects
- [ ] Test API service layer with mocked responses

### [ ] 11.3 UAT Support
- [ ] Prepare test accounts per role for client UAT
- [ ] Document tested flows and known edge cases
