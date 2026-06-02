import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth-store";
import { getToken } from "@/lib/session";
import { employerProfileSchema, type EmployerProfileFormValues } from "@/lib/validators";
import { getEmployerProfile, getJobs, getMyAssignments, updateEmployerProfile } from "@/lib/marketplace";
import type { EmployerProfile, Job, Assignment } from "@/types";

export function useEmployerDashboard() {
  const token = useAuthStore((s) => s.token) || getToken();
  const user = useAuthStore((s) => s.user);

  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<EmployerProfileFormValues>({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      company_name: "",
      business_type: "",
      contact_person: "",
      location_text: "",
      description: "",
    },
  });

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const [profileData, jobsData, assignmentsData] = await Promise.all([
        getEmployerProfile(token),
        getJobs(),
        getMyAssignments(token),
      ]);

      setProfile(profileData);
      setJobs(jobsData);
      setAssignments(assignmentsData);

      form.reset({
        company_name: profileData.company_name || "",
        business_type: profileData.business_type || "",
        contact_person: profileData.contact_person || "",
        location_text: profileData.location_text || "",
        description: profileData.description || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load system workspace data.");
    } finally {
      setLoading(false);
    }
  }, [token, form]);

  useEffect(() => {
    const initialize = async () => {
      await loadDashboardData();
    };

    initialize();
  }, [loadDashboardData]);

  const myJobs = useMemo(() => {
    if (!profile) return [];
    return jobs.filter((job) => job.employer_profile_id === profile.id);
  }, [jobs, profile]);

  const metrics = useMemo(() => {
    const counts = { draft: 0, open: 0, assigned: 0, in_progress: 0, completed: 0 };
    myJobs.forEach((job) => {
      const status = job.status as keyof typeof counts;
      if (status in counts) counts[status]++;
    });
    return [
      { label: "Draft Jobs", count: counts.draft },
      { label: "Open Jobs", count: counts.open },
      { label: "Assigned", count: counts.assigned },
      { label: "In Progress", count: counts.in_progress },
      { label: "Assignments", count: assignments.length },
    ];
  }, [myJobs, assignments.length]);

  const isProfileComplete = useMemo(() => {
    if (!profile) return false;
    return Boolean(
      profile.company_name &&
      profile.business_type &&
      profile.contact_person &&
      profile.location_text &&
      profile.description
    );
  }, [profile]);

  async function handleProfileSubmit(values: EmployerProfileFormValues) {
    if (!token) return;
    setSuccessMessage(null);
    setError(null);

    try {
      const updated = await updateEmployerProfile(
        {
          company_name: values.company_name || null,
          business_type: values.business_type || null,
          contact_person: values.contact_person || null,
          location_text: values.location_text || null,
          description: values.description || null,
        },
        token
      );
      setProfile(updated);
      setSuccessMessage("Corporate profile configurations updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profile update failed.");
    }
  }

  return {
    user,
    form,
    metrics,
    myJobs,
    loading,
    error,
    successMessage,
    isProfileComplete,
    handleProfileSubmit,
  };
}
