import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(30).optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["worker", "employer"]),
});

export const workerProfileSchema = z.object({
  bio: z.string().max(500).optional().or(z.literal("")),
  years_experience: z.coerce.number().int().min(0).max(60).optional().or(z.literal("")),
  location_text: z.string().max(255).optional().or(z.literal("")),
  hourly_expected_rate: z.coerce.number().min(0).optional().or(z.literal("")),
  availability_status: z.string().max(40),
  profile_photo_url: z.string().url().optional().or(z.literal("")),
});

export const employerProfileSchema = z.object({
  company_name: z.string().max(255).optional().or(z.literal("")),
  business_type: z.string().max(120).optional().or(z.literal("")),
  contact_person: z.string().max(120).optional().or(z.literal("")),
  location_text: z.string().max(255).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
});

export const jobSchema = z.object({
  title: z.string().min(3).max(180),
  description: z.string().min(10, "Job description is required"),
  location_text: z.string().max(255).optional().or(z.literal("")),
  required_workers: z.coerce.number().int().min(1).max(500),
  pay_type: z.enum(["hourly", "daily", "weekly", "monthly", "fixed"]),
  pay_amount: z.coerce.number().min(0),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  start_time: z.string().optional().or(z.literal("")),
  end_time: z.string().optional().or(z.literal("")),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type WorkerProfileFormValues = z.infer<typeof workerProfileSchema>;
export type EmployerProfileFormValues = z.infer<typeof employerProfileSchema>;
export type JobFormValues = z.infer<typeof jobSchema>;