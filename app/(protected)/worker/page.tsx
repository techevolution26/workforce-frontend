"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useAuthStore } from "@/store/auth-store";
import { getToken } from "@/lib/session";
import {
  addAvailabilityBlock,
  addWorkerSkill,
  deleteAvailabilityBlock,
  deleteWorkerSkill,
  getJobs,
  getMyAssignments,
  getSkills,
  getWorkerProfile,
  updateWorkerProfile,
} from "@/lib/marketplace";
import type { Assignment, Job, WorkerProfile } from "@/types";
import type { Skill } from "@/lib/marketplace";
import {
  workerProfileSchema,
  type WorkerProfileFormValues,
} from "@/lib/validators";

type SkillFormValues = {
  skill_id: string;
  years_experience: string;
  experience_level: string;
};

type AvailabilityFormValues = {
  day_of_week: string;
  start_time: string;
  end_time: string;
};

const dayLabel = (day: number) =>
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day] ?? String(day);

function isComplete(profile: WorkerProfile | null) {
  if (!profile) return false;
  return Boolean(
    profile.bio &&
    profile.years_experience !== null &&
    profile.location_text &&
    profile.hourly_expected_rate !== null &&
    profile.availability_status
  );
}

export default function WorkerPage() {
  const token = useAuthStore((s) => s.token) || getToken();
  const user = useAuthStore((s) => s.user);

  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [skillMessage, setSkillMessage] = useState("");
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  const profileForm = useForm<WorkerProfileFormValues>({
    resolver: zodResolver(workerProfileSchema) as Resolver<WorkerProfileFormValues>,
    defaultValues: {
      bio: "",
      years_experience: "",
      location_text: "",
      hourly_expected_rate: "",
      availability_status: "available",
      profile_photo_url: "",
    },
  });

  const skillForm = useForm<SkillFormValues>({
    defaultValues: {
      skill_id: "",
      years_experience: "",
      experience_level: "",
    },
  });

  const availabilityForm = useForm<AvailabilityFormValues>({
    defaultValues: {
      day_of_week: "0",
      start_time: "",
      end_time: "",
    },
  });

  async function load() {
    if (!token) return;

    setError("");

    try {
      const [profileData, skillsData, jobsData, assignmentsData] = await Promise.all([
        getWorkerProfile(token),
        getSkills(),
        getJobs(),
        getMyAssignments(token),
      ]);

      setProfile(profileData);
      setSkills(skillsData);
      setJobs(jobsData);
      setAssignments(assignmentsData);

      profileForm.reset({
        bio: profileData.bio ?? "",
        years_experience:
          profileData.years_experience === null ? "" : profileData.years_experience,
        location_text: profileData.location_text ?? "",
        hourly_expected_rate:
          profileData.hourly_expected_rate === null
            ? ""
            : Number(profileData.hourly_expected_rate),
        availability_status: profileData.availability_status || "available",
        profile_photo_url: profileData.profile_photo_url ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load worker hub");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const loadWorkerHub = async () => {
      await load();
    };

    void loadWorkerHub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openJobs = useMemo(
    () => jobs.filter((job) => job.status === "open"),
    [jobs]
  );

  const stats = useMemo(
    () => ({
      openJobs: openJobs.length,
      pending: assignments.filter((a) => a.status === "pending").length,
      accepted: assignments.filter((a) => a.status === "accepted").length,
      completed: assignments.filter((a) => a.status === "completed").length,
    }),
    [assignments, openJobs.length]
  );

  async function saveProfile(values: WorkerProfileFormValues) {
    setMessage("");
    try {
      const updated = await updateWorkerProfile(
        {
          bio: values.bio || null,
          years_experience: values.years_experience === "" ? null : Number(values.years_experience),
          location_text: values.location_text || null,
          hourly_expected_rate:
            values.hourly_expected_rate === "" ? null : Number(values.hourly_expected_rate),
          availability_status: values.availability_status,
          profile_photo_url: values.profile_photo_url || null,
        },
        token
      );
      setProfile(updated);
      setMessage("Worker profile saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save profile");
    }
  }

  async function addSkill(values: SkillFormValues) {
    setSkillMessage("");
    try {
      await addWorkerSkill(
        {
          skill_id: Number(values.skill_id),
          years_experience: values.years_experience === "" ? null : Number(values.years_experience),
          experience_level: values.experience_level === "" ? null : Number(values.experience_level),
        },
        token
      );
      await load();
      skillForm.reset({ skill_id: "", years_experience: "", experience_level: "" });
      setSkillMessage("Skill added.");
    } catch (err) {
      setSkillMessage(err instanceof Error ? err.message : "Failed to add skill");
    }
  }

  async function removeSkill(skillId: number) {
    if (!token) return;
    try {
      await deleteWorkerSkill(skillId, token);
      await load();
    } catch (err) {
      setSkillMessage(err instanceof Error ? err.message : "Failed to remove skill");
    }
  }

  async function addAvailability(values: AvailabilityFormValues) {
    setAvailabilityMessage("");
    try {
      await addAvailabilityBlock(
        {
          day_of_week: Number(values.day_of_week),
          start_time: values.start_time,
          end_time: values.end_time,
          is_recurring: true,
          active: true,
        },
        token
      );
      await load();
      availabilityForm.reset({ day_of_week: "0", start_time: "", end_time: "" });
      setAvailabilityMessage("Availability added.");
    } catch (err) {
      setAvailabilityMessage(err instanceof Error ? err.message : "Failed to add availability");
    }
  }

  async function removeAvailability(blockId: number) {
    if (!token) return;
    try {
      await deleteAvailabilityBlock(blockId, token);
      await load();
    } catch (err) {
      setAvailabilityMessage(err instanceof Error ? err.message : "Failed to remove availability");
    }
  }

  if (loading) {
    return <Card>Loading worker hub...</Card>;
  }

  if (error) {
    return <Card className="border-red-200 text-red-700">{error}</Card>;
  }

  const profileComplete = isComplete(profile);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Worker hub</h1>
            <p className="mt-2 text-sm text-neutral-600">
              {user?.full_name} can manage skills, availability, and work requests here.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/jobs">
              <Button>Browse jobs</Button>
            </Link>
            <Link href="/applications">
              <Button variant="secondary">Assignments</Button>
            </Link>
          </div>
        </div>
      </Card>

      {!profileComplete ? (
        <Card className="border-amber-200 bg-amber-50">
          <h2 className="text-lg font-semibold">Complete your worker profile</h2>
          <p className="mt-2 text-sm text-neutral-700">
            Fill in your bio, experience, location, and rate so employers can find you.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-neutral-500">Open jobs</p>
          <p className="mt-2 text-3xl font-semibold">{stats.openJobs}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Pending assignments</p>
          <p className="mt-2 text-3xl font-semibold">{stats.pending}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Accepted</p>
          <p className="mt-2 text-3xl font-semibold">{stats.accepted}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Completed</p>
          <p className="mt-2 text-3xl font-semibold">{stats.completed}</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Profile</h2>
            <form className="mt-6 space-y-4" onSubmit={profileForm.handleSubmit(saveProfile)}>
              <Textarea placeholder="Bio" {...profileForm.register("bio")} />
              <Input placeholder="Years experience" {...profileForm.register("years_experience")} />
              <Input placeholder="Location" {...profileForm.register("location_text")} />
              <Input placeholder="Hourly expected rate" {...profileForm.register("hourly_expected_rate")} />

              <Select {...profileForm.register("availability_status")}>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </Select>

              <Input placeholder="Profile photo URL" {...profileForm.register("profile_photo_url")} />

              <Button type="submit">Save profile</Button>
            </form>

            {message ? <p className="mt-4 text-sm text-neutral-600">{message}</p> : null}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Skills</h2>
            <form
              className="mt-6 grid gap-3 md:grid-cols-4"
              onSubmit={skillForm.handleSubmit(addSkill)}
            >
              <Select {...skillForm.register("skill_id")}>
                <option value="">Select skill</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.category} · {skill.name}
                  </option>
                ))}
              </Select>
              <Input placeholder="Years exp" {...skillForm.register("years_experience")} />
              <Input placeholder="Level 1-10" {...skillForm.register("experience_level")} />
              <Button type="submit">Add skill</Button>
            </form>

            {skillMessage ? (
              <p className="mt-4 text-sm text-neutral-600">{skillMessage}</p>
            ) : null}

            <div className="mt-6 grid gap-3">
              {(profile?.worker_skills || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                >
                  <div>
                    <p className="font-medium">
                      {item.skill?.name || `Skill #${item.skill_id}`}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {item.skill?.category || "Uncategorized"} ·{" "}
                      {item.years_experience ?? "—"} yrs · Level{" "}
                      {item.experience_level ?? "—"}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => removeSkill(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              {(profile?.worker_skills || []).length === 0 ? (
                <p className="text-sm text-neutral-500">No skills added yet.</p>
              ) : null}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Availability</h2>
            <form
              className="mt-6 grid gap-3 md:grid-cols-4"
              onSubmit={availabilityForm.handleSubmit(addAvailability)}
            >
              <Select {...availabilityForm.register("day_of_week")}>
                <option value="0">Mon</option>
                <option value="1">Tue</option>
                <option value="2">Wed</option>
                <option value="3">Thu</option>
                <option value="4">Fri</option>
                <option value="5">Sat</option>
                <option value="6">Sun</option>
              </Select>
              <Input type="time" {...availabilityForm.register("start_time")} />
              <Input type="time" {...availabilityForm.register("end_time")} />
              <Button type="submit">Add slot</Button>
            </form>

            {availabilityMessage ? (
              <p className="mt-4 text-sm text-neutral-600">{availabilityMessage}</p>
            ) : null}

            <div className="mt-6 grid gap-3">
              {(profile?.availability_blocks || []).map((block) => (
                <div
                  key={block.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                >
                  <div>
                    <p className="font-medium">
                      {dayLabel(block.day_of_week)} · {block.start_time} - {block.end_time}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {block.is_recurring ? "Recurring" : "One-time"} ·{" "}
                      {block.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => removeAvailability(block.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              {(profile?.availability_blocks || []).length === 0 ? (
                <p className="text-sm text-neutral-500">No availability slots yet.</p>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Your current setup</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>• Profile status: {profile?.verification_status}</li>
              <li>• Availability: {profile?.availability_status}</li>
              <li>• Skills: {(profile?.worker_skills || []).length}</li>
              <li>• Availability slots: {(profile?.availability_blocks || []).length}</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Open jobs</h2>
            <div className="mt-4 space-y-3">
              {openJobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                >
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-neutral-600">
                    {job.location_text || "No location"} · {job.pay_type} · {job.pay_amount}
                  </p>
                  <div className="mt-3">
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="secondary">View</Button>
                    </Link>
                  </div>
                </div>
              ))}

              {openJobs.length === 0 ? (
                <p className="text-sm text-neutral-500">No open jobs right now.</p>
              ) : null}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Assignments</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Review offers, accept work, and track active jobs in one place.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/worker/assignments">
                <Button>Open assignments</Button>
              </Link>
              <Link href="/applications">
                <Button variant="secondary">Full list</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}