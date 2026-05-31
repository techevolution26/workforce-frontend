import { apiFetch } from "@/lib/api";
import type {
  Assignment,
  EmployerProfile,
  Job,
  JobCreatePayload,
  JobUpdatePayload,
  WorkerProfile,
} from "@/types";

export interface Skill {
  id: number;
  name: string;
  category: string;
  active: boolean;
}

export interface WorkerSkillPayload {
  skill_id: number;
  years_experience?: number | null;
  experience_level?: number | null;
}

export interface AvailabilityBlockPayload {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring?: boolean;
  active?: boolean;
}

export function getSkills() {
  return apiFetch<Skill[]>("/skills");
}

export function getJobs() {
  return apiFetch<Job[]>("/jobs");
}

export function getJob(jobId: number) {
  return apiFetch<Job>(`/jobs/${jobId}`);
}

export function createJob(payload: JobCreatePayload, token?: string | null) {
  return apiFetch<Job>("/jobs", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateJob(jobId: number, payload: JobUpdatePayload, token?: string | null) {
  return apiFetch<Job>(`/jobs/${jobId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function publishJob(jobId: number, token?: string | null) {
  return apiFetch<Job>(`/jobs/${jobId}/publish`, {
    method: "POST",
    token,
  });
}

export function cancelJob(jobId: number, token?: string | null) {
  return apiFetch<Job>(`/jobs/${jobId}/cancel`, {
    method: "POST",
    token,
  });
}

export function applyForJob(jobId: number, token?: string | null) {
  return apiFetch<Assignment>(`/jobs/${jobId}/apply`, {
    method: "POST",
    token,
  });
}

export function assignWorkerToJob(jobId: number, workerProfileId: number, token?: string | null) {
  return apiFetch<Assignment>(`/jobs/${jobId}/assign/${workerProfileId}`, {
    method: "POST",
    token,
  });
}

export function getMyAssignments(token?: string | null) {
  return apiFetch<Assignment[]>("/assignments/me", {
    method: "GET",
    token,
  });
}

export function acceptAssignment(assignmentId: number, token?: string | null) {
  return apiFetch<Assignment>(`/assignments/${assignmentId}/accept`, {
    method: "POST",
    token,
  });
}

export function rejectAssignment(assignmentId: number, token?: string | null) {
  return apiFetch<Assignment>(`/assignments/${assignmentId}/reject`, {
    method: "POST",
    token,
  });
}

export function startAssignment(assignmentId: number, token?: string | null) {
  return apiFetch<Assignment>(`/assignments/${assignmentId}/start`, {
    method: "POST",
    token,
  });
}

export function completeAssignment(assignmentId: number, token?: string | null) {
  return apiFetch<Assignment>(`/assignments/${assignmentId}/complete`, {
    method: "POST",
    token,
  });
}

export function cancelAssignment(assignmentId: number, token?: string | null) {
  return apiFetch<Assignment>(`/assignments/${assignmentId}/cancel`, {
    method: "POST",
    token,
  });
}

export function updateWorkerProfile(payload: Partial<WorkerProfile>, token?: string | null) {
  return apiFetch<WorkerProfile>("/workers/me/profile", {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateEmployerProfile(payload: Partial<EmployerProfile>, token?: string | null) {
  return apiFetch<EmployerProfile>("/employers/me/profile", {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function addWorkerSkill(payload: WorkerSkillPayload, token?: string | null) {
  return apiFetch("/workers/me/skills", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteWorkerSkill(workerSkillId: number, token?: string | null) {
  return apiFetch<void>(`/workers/me/skills/${workerSkillId}`, {
    method: "DELETE",
    token,
  });
}

export function addAvailabilityBlock(payload: AvailabilityBlockPayload, token?: string | null) {
  return apiFetch("/workers/me/availability", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteAvailabilityBlock(availabilityBlockId: number, token?: string | null) {
  return apiFetch<void>(`/workers/me/availability/${availabilityBlockId}`, {
    method: "DELETE",
    token,
  });
}