export type UserRole = "worker" | "employer" | "admin";
export type UserStatus = "active" | "suspended" | "pending";

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus | string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone?: string | null;
  password: string;
  role: Exclude<UserRole, "admin">;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
}

export interface WorkerSkill {
  id: number;
  skill_id: number;
  years_experience: number | null;
  experience_level: number | null;
}

export interface AvailabilityBlock {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  active: boolean;
}

export interface WorkerProfile {
  id: number;
  user_id: number;
  bio: string | null;
  years_experience: number | null;
  location_text: string | null;
  hourly_expected_rate: string | null;
  availability_status: string;
  profile_photo_url: string | null;
  verification_status: string;
  is_active: boolean;
  worker_skills: WorkerSkill[];
  availability_blocks: AvailabilityBlock[];
}

export interface EmployerProfile {
  id: number;
  user_id: number;
  company_name: string | null;
  business_type: string | null;
  contact_person: string | null;
  location_text: string | null;
  description: string | null;
  verification_status: string;
  is_active: boolean;
}

export type PayType = "hourly" | "daily" | "weekly" | "monthly" | "fixed";
export type JobStatus = "draft" | "open" | "assigned" | "in_progress" | "completed" | "cancelled";
export type AssignmentStatus = "pending" | "accepted" | "rejected" | "cancelled" | "completed";

export interface JobRequiredSkill {
  id: number;
  skill_id: number;
  required_level: number | null;
}

export interface Job {
  id: number;
  employer_profile_id: number;
  title: string;
  description: string;
  location_text: string | null;
  required_workers: number;
  pay_type: PayType;
  pay_amount: string;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: JobStatus;
  required_skills: JobRequiredSkill[];
}

export interface JobCreatePayload {
  title: string;
  description: string;
  location_text?: string | null;
  required_workers: number;
  pay_type: PayType;
  pay_amount: string;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  required_skills: Array<{
    skill_id: number;
    required_level?: number | null;
  }>;
}

export interface JobUpdatePayload extends Partial<JobCreatePayload> {
  status?: JobStatus;
}

export interface Assignment {
  id: number;
  job_id: number;
  worker_profile_id: number;
  status: AssignmentStatus;
  assigned_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  job?: Job;
}

export interface ApiErrorShape {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  detail?: string;
}