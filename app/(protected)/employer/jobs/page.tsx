"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cancelJob, getEmployerProfile, getJobs, publishJob } from "@/lib/marketplace";
import { getToken } from "@/lib/session";
import { useAuthStore } from "@/store/auth-store";
import type { EmployerProfile, Job } from "@/types";

const FILTERS = ["all", "draft", "open", "assigned", "in_progress", "completed", "cancelled"] as const;
type Filter = (typeof FILTERS)[number];

export default function EmployerJobsPage() {
    const token = useAuthStore((s) => s.token) || getToken();
    const [profile, setProfile] = useState<EmployerProfile | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filter, setFilter] = useState<Filter>("all");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    async function load() {
        if (!token) return;

        try {
            const [profileData, jobsData] = await Promise.all([
                getEmployerProfile(token),
                getJobs(),
            ]);

            setProfile(profileData);
            setJobs(jobsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load jobs");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [token]);

    const myJobs = useMemo(() => {
        if (!profile) return [];
        return jobs
            .filter((job) => job.employer_profile_id === profile.id)
            .filter((job) => (filter === "all" ? true : job.status === filter));
    }, [filter, jobs, profile]);

    async function refreshAfter(action: () => Promise<unknown>) {
        try {
            await action();
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Action failed");
        }
    }

    if (loading) {
        return <Card>Loading employer jobs...</Card>;
    }

    if (error) {
        return <Card className="border-red-200 text-red-700">{error}</Card>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">My jobs</h1>
                        <p className="mt-2 text-sm text-neutral-600">
                            Review drafts, active jobs, and execution progress.
                        </p>
                    </div>
                    <Link href="/jobs/new">
                        <Button>Create job</Button>
                    </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {FILTERS.map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={[
                                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                                filter === item
                                    ? "bg-neutral-900 text-white"
                                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                            ].join(" ")}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </Card>

            <div className="grid gap-4">
                {myJobs.map((job) => (
                    <Card key={job.id}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-2">
                                <div>
                                    <h2 className="text-lg font-semibold">{job.title}</h2>
                                    <p className="text-sm text-neutral-600">
                                        {job.location_text || "No location"} · {job.pay_type} · {job.pay_amount}
                                    </p>
                                </div>
                                <p className="text-sm text-neutral-600">{job.description}</p>
                            </div>

                            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                                {job.status}
                            </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link href={`/jobs/${job.id}`}>
                                <Button variant="secondary">Open</Button>
                            </Link>

                            {job.status === "draft" || job.status === "open" ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => refreshAfter(() => publishJob(job.id, token))}
                                >
                                    Publish
                                </Button>
                            ) : null}

                            {job.status !== "completed" && job.status !== "cancelled" ? (
                                <Button
                                    variant="danger"
                                    onClick={() => refreshAfter(() => cancelJob(job.id, token))}
                                >
                                    Cancel
                                </Button>
                            ) : null}
                        </div>
                    </Card>
                ))}

                {myJobs.length === 0 ? (
                    <Card>
                        <p className="text-sm text-neutral-500">No jobs in this filter.</p>
                    </Card>
                ) : null}
            </div>
        </div>
    );
}