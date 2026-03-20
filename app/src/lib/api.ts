import axios from "axios";

import type { JobApplicationPayload, JobPosting, PublicJobPosting, ResumeCandidate } from "@/types/recruitment";

type ListResponse<T> = {
  items: T[];
};

type LoginResponse = {
  authenticated: boolean;
  role: "hr" | "candidate";
  message: string;
};

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function fetchCandidates(): Promise<ResumeCandidate[]> {
  const response = await api.get<ListResponse<ResumeCandidate>>("/candidates");
  return response.data.items;
}

export async function saveCandidates(items: ResumeCandidate[]): Promise<ResumeCandidate[]> {
  const response = await api.put<ListResponse<ResumeCandidate>>("/candidates", { items });
  return response.data.items;
}

export async function deleteCandidate(candidateId: string): Promise<void> {
  await api.delete(`/candidates/${candidateId}`);
}

export async function fetchJobs(): Promise<JobPosting[]> {
  const response = await api.get<ListResponse<JobPosting>>("/jobs");
  return response.data.items;
}

export async function saveJobs(items: JobPosting[]): Promise<JobPosting[]> {
  const response = await api.put<ListResponse<JobPosting>>("/jobs", { items });
  return response.data.items;
}

export async function createJob(input: { title: string; requiredAts: number; jdFile: File }): Promise<JobPosting> {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("requiredAts", String(input.requiredAts));
  formData.append("jdFile", input.jdFile);

  const response = await api.post<JobPosting>("/jobs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updateJob(input: {
  jobId: string;
  title: string;
  requiredAts: number;
  jdFile?: File | null;
}): Promise<JobPosting> {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("requiredAts", String(input.requiredAts));
  if (input.jdFile) {
    formData.append("jdFile", input.jdFile);
  }

  const response = await api.put<JobPosting>(`/jobs/${input.jobId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteJob(jobId: string): Promise<void> {
  await api.delete(`/jobs/${jobId}`);
}

export async function getPublicJob(applySlug: string): Promise<PublicJobPosting> {
  const response = await api.get<PublicJobPosting>(`/jobs/public/${applySlug}`);
  return response.data;
}

export async function submitJobApplication(applySlug: string, payload: JobApplicationPayload): Promise<void> {
  const formData = new FormData();
  formData.append("fullName", payload.fullName);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone ?? "");
  formData.append("location", payload.location ?? "");
  formData.append("totalExperience", payload.totalExperience ?? "");
  formData.append("currentCompany", payload.currentCompany ?? "");
  formData.append("linkedinUrl", payload.linkedinUrl ?? "");
  formData.append("portfolioUrl", payload.portfolioUrl ?? "");
  formData.append("education", payload.education ?? "");
  formData.append("professionalSummary", payload.professionalSummary ?? "");
  formData.append("resume", payload.resume);
  if (payload.profilePhoto) {
    formData.append("profilePhoto", payload.profilePhoto);
  }

  await api.post(`/jobs/public/${applySlug}/apply`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
}

export async function loginWithCredentials(username: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
  });
  return response.data;
}

export async function authorizeCandidateForTest(candidateId: string): Promise<{
  success: boolean;
  message: string;
  candidateId: string;
  email?: string;
  password?: string;
}> {
  const response = await api.post("/candidates/authorize", {
    candidateId,
  });
  return response.data;
}

export async function candidateLogin(username: string, password: string): Promise<{
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}> {
  const response = await api.post("/auth/candidate/login", undefined, {
    params: { username, password },
  });
  
  // Store tokens in localStorage and set Authorization header
  if (response.data.access_token) {
    setAuthToken(response.data.access_token);
    localStorage.setItem("candidateRefreshToken", response.data.refresh_token);
    localStorage.setItem("tokenExpiresAt", new Date(Date.now() + response.data.expires_in * 1000).toISOString());
  }
  
  return response.data;
}

export async function refreshCandidateToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}> {
  const response = await api.post("/auth/candidate/refresh", undefined, {
    params: { refresh_token: refreshToken },
  });
  
  // Update stored tokens
  if (response.data.access_token) {
    localStorage.setItem("candidateAccessToken", response.data.access_token);
    localStorage.setItem("candidateRefreshToken", response.data.refresh_token);
    localStorage.setItem("tokenExpiresAt", new Date(Date.now() + response.data.expires_in * 1000).toISOString());
  }
  
  return response.data;
}

export function getCandidateToken(): string | null {
  return localStorage.getItem("candidateAccessToken");
}

export function getCandidateRefreshToken(): string | null {
  return localStorage.getItem("candidateRefreshToken");
}

export function clearCandidateTokens(): void {
  localStorage.removeItem("candidateAccessToken");
  localStorage.removeItem("candidateRefreshToken");
  localStorage.removeItem("tokenExpiresAt");
  delete api.defaults.headers.common["Authorization"];
}

export function setAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("candidateAccessToken", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    clearCandidateTokens();
  }
}

export function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem("tokenExpiresAt");
  if (!expiresAt) return true;
  return new Date(expiresAt) < new Date();
}

export async function verifyCandidateToken(token: string): Promise<{
  valid: boolean;
  candidateId: string;
  email: string;
  expiresAt: string;
}> {
  const response = await api.post("/auth/candidate/validate", undefined, {
    params: { token },
  });
  return response.data;
}
