"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getToken } from "@/lib/session";
import {
  addAvailabilityBlock,
  addWorkerSkill,
  deleteAvailabilityBlock,
  deleteWorkerSkill,
  getSkills,
  updateWorkerProfile,
} from "@/lib/marketplace";
import type { Skill, WorkerProfile } from "@/lib/marketplace";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workerProfileSchema, type WorkerProfileFormValues } from "@/lib/validators";

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

export default function WorkerPage() {
  const token = useAuthStore((s) => s.token) || getToken();
  const user = useAuthStore((s) => s.user);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [message, setMessage] = useState("");
  const [skillMessage, setSkillMessage] = useState("");
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  const workerProfile = useAuthStore((s) => s.user); // session only; profile comes from API later

  const profileForm = useForm<WorkerProfileFormValues>({
    resolver: zodResolver(workerProfileSchema),
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

  useEffect(() => {
    getSkills().then(setSkills).catch(() => setSkills([]));
  }, []);

  async function onSaveProfile(values: WorkerProfileFormValues) {
    setMessage("");

    try {
      await updateWorkerProfile(
        {
          bio: values.bio || null,
          years_experience: values.years_experience === "" ? null : Number(values.years_experience),
          location_text: values.location_text || null,
          hourly_expected_rate: values.hourly_expected_rate === "" ? null : Number(values.hourly_expected_rate),
          availability_status: values.availability_status,
          profile_photo_url: values.profile_photo_url || null,
        },
        token
      );
      setMessage("Worker profile updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function onAddSkill(values: SkillFormValues) {
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
      setSkillMessage("Skill added.");
    } catch (error) {
      setSkillMessage(error instanceof Error ? error.message : "Skill add failed");
    }
  }

  async function onAddAvailability(values: AvailabilityFormValues) {
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
      setAvailabilityMessage("Availability added.");
    } catch (error) {
      setAvailabilityMessage(error instanceof Error ? error.message : "Availability add failed");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <Card>
          <h1 className="text-2xl font-semibold tracking-tight">Worker profile</h1>
          <p className="mt-2 text-sm text-neutral-600">
            {user?.full_name} can manage skills and availability here.
          </p>

          <form className="mt-6 space-y-4" onSubmit={profileForm.handleSubmit(onSaveProfile)}>
            <Textarea placeholder="Bio" {...profileForm.register("bio")} />
            <Input placeholder="Years experience" {...profileForm.register("years_experience")} />
            <Input placeholder="Location" {...profileForm.register("location_text")} />
            <Input placeholder="Hourly expected rate" {...profileForm.register("hourly_expected_rate")} />
            <Input placeholder="Availability status" {...profileForm.register("availability_status")} />
            <Input placeholder="Profile photo URL" {...profileForm.register("profile_photo_url")} />

            <Button type="submit">Save profile</Button>
          </form>

          {message ? <p className="mt-4 text-sm text-neutral-600">{message}</p> : null}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Skills</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={skillForm.handleSubmit(onAddSkill)}>
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

          {skillMessage ? <p className="mt-4 text-sm text-neutral-600">{skillMessage}</p> : null}

          <p className="mt-4 text-sm text-neutral-500">
            Your current skills are loaded from the profile endpoint. Once you add the dedicated profile fetch endpoint, show them here as cards with remove actions.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Availability blocks</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={availabilityForm.handleSubmit(onAddAvailability)}>
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

          {availabilityMessage ? <p className="mt-4 text-sm text-neutral-600">{availabilityMessage}</p> : null}
        </Card>
      </div>

      <Card className="h-fit">
        <h2 className="text-lg font-semibold">Production note</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          The worker area is now ready for a proper “profile + skills + availability” workflow.
          The remaining polish is to fetch and render the profile’s live skills and availability lists
          with delete buttons and empty states.
        </p>
      </Card>
    </div>
  );
}