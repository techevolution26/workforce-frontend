"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { getEmployerProfile, getJobs, getMyAssignments, updateEmployerProfile } from "@/lib/marketplace";
import { getToken } from "@/lib/session";
import { useAuthStore } from "@/store/auth-store";
import type { EmployerProfile, Job, Assignment } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employerProfileSchema, type EmployerProfileFormValues } from "@/lib/validators";

function isProfileComplete(profile: EmployerProfile | null) {
    if (!profile) return false;
    return Boolean(
        profile.company_name &&
        profile.business_type &&
        profile.contact_person &&
        profile.location_text &&
        profile.description
    );
}

export default function EmployerPage() {
    const token = useAuthStore((s) => s.token) || getToken();
    const user = useAuthStore((s) => s.user);

    const [profile, setProfile] = useState<EmployerProfile | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

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

    async function load() {
        if (!token) return;

        setError("");

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
            setError(err instanceof Error ? err.message : "Failed to load employer hub");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [token]);

    const myJobs = useMemo(() => {
        if (!profile) return [];
        return jobs.filter((job) => job.employer_profile_id === profile.id);
    }, [jobs, profile]);

    const summary = useMemo(
        () => ({
            draft: myJobs.filter((job) => job.status === "draft").length,
            open: myJobs.filter((job) => job.status === "open").length,
            assigned: myJobs.filter((job) => job.status === "assigned").length,
            progress: myJobs.filter((job) => job.status === "in_progress").length,
            completed: myJobs.filter((job) => job.status === "completed").length,
            assignments: assignments.length,
        }),
        [assignments.length, myJobs]
    );

    async function onSubmit(values: EmployerProfileFormValues) {
        setMessage("");
        setError("");

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
            setMessage("Employer profile saved.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Update failed");
        }
    }

    if (loading) {
        return <Card>Loading employer hub...</Card>;
    }

    if (error) {
        return <Card className="border-red-200 text-red-700">{error}</Card>;
    }

    const onboardingComplete = isProfileComplete(profile);

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Employer hub</h1>
                        <p className="mt-2 text-sm text-neutral-600">
                            {user?.full_name} is managing hiring operations here.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link href="/jobs/new">
                            <Button>Create job</Button>
                        </Link>
                        <Link href="/employer/jobs">
                            <Button variant="secondary">My jobs</Button>
                        </Link>
                    </div>
                </div>
            </Card>

            {!onboardingComplete ? (
                <Card className="border-amber-200 bg-amber-50">
                    <h2 className="text-lg font-semibold">Complete your employer setup</h2>
                    <p className="mt-2 text-sm text-neutral-700">
                        Your employer profile exists, but it is not complete yet. Fill in the company details below before publishing jobs.
                    </p>
                </Card>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <Card><p className="text-sm text-neutral-500">Draft jobs</p><p className="mt-2 text-3xl font-semibold">{summary.draft}</p></Card>
                <Card><p className="text-sm text-neutral-500">Open jobs</p><p className="mt-2 text-3xl font-semibold">{summary.open}</p></Card>
                <Card><p className="text-sm text-neutral-500">Assigned</p><p className="mt-2 text-3xl font-semibold">{summary.assigned}</p></Card>
                <Card><p className="text-sm text-neutral-500">In progress</p><p className="mt-2 text-3xl font-semibold">{summary.progress}</p></Card>
                <Card><p className="text-sm text-neutral-500">Assignments</p><p className="mt-2 text-3xl font-semibold">{summary.assignments}</p></Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <Card>
                    <h2 className="text-lg font-semibold">Company profile</h2>

                    <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <Input placeholder="Company name" {...form.register("company_name")} />
                        <Input placeholder="Business type" {...form.register("business_type")} />
                        <Input placeholder="Contact person" {...form.register("contact_person")} />
                        <Input placeholder="Location" {...form.register("location_text")} />
                        <Textarea placeholder="Description" {...form.register("description")} />

                        <Button type="submit">Save profile</Button>
                    </form>

                    {message ? <p className="mt-4 text-sm text-neutral-600">{message}</p> : null}
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold">What this account can do</h2>
                    <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                        <li>• Create and publish jobs</li>
                        <li>• Review job assignments</li>
                        <li>• Track job progress</li>
                        <li>• Later: search and shortlist workers</li>
                    </ul>
                </Card>
            </div>

            <Card>
                <h2 className="text-lg font-semibold">My jobs</h2>
                <div className="mt-4 grid gap-4">
                    {myJobs.map((job) => (
                        <div
                            key={job.id}
                            className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                        >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h3 className="font-medium">{job.title}</h3>
                                    <p className="text-sm text-neutral-600">
                                        {job.location_text || "No location"} · {job.pay_type} · {job.pay_amount}
                                    </p>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                                    {job.status}
                                </span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <Link href={`/jobs/${job.id}`}>
                                    <Button variant="secondary">Open</Button>
                                </Link>
                                <Link href="/jobs/new">
                                    <Button variant="secondary">New job</Button>
                                </Link>
                            </div>
                        </div>
                    ))}

                    {myJobs.length === 0 ? (
                        <p className="text-sm text-neutral-500">No jobs created yet.</p>
                    ) : null}
                </div>
            </Card>
        </div>
    );
}