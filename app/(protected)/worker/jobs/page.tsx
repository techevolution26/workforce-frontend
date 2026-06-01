"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyForJob, getJobs } from "@/lib/marketplace";
import { getToken } from "@/lib/session";
import { useAuthStore } from "@/store/auth-store";
import type { Job } from "@/types";

export default function WorkerJobsPage() {
    const token = useAuthStore((s) => s.token) || getToken();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [query, setQuery] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            const data = await getJobs();
            setJobs(data);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed to load jobs");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const openJobs = useMemo(() => {
        const q = query.trim().toLowerCase();
        return jobs.filter((job) => {
            if (job.status !== "open") return false;
            if (!q) return true;
            return (
                job.title.toLowerCase().includes(q) ||
                job.description.toLowerCase().includes(q) ||
                (job.location_text || "").toLowerCase().includes(q)
            );
        });
    }, [jobs, query]);

    async function handleApply(jobId: number) {
        if (!token) return;
        setMessage("");
        try {
            await applyForJob(jobId, token);
            setMessage("Application submitted.");
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed to apply");
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Available jobs</h1>
                        <p className="mt-1 text-sm text-neutral-600">
                            Search and apply to open work opportunities.
                        </p>
                    </div>
                    <Link href="/worker">
                        <Button variant="secondary">Back to worker hub</Button>
                    </Link>
                </div>

                <div className="mt-4">
                    <Input
                        placeholder="Search by title, description, location"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </Card>

            {loading ? <Card>Loading jobs...</Card> : null}
            {message ? <Card className="border-red-200 text-red-700">{message}</Card> : null}

            <div className="grid gap-4">
                {openJobs.map((job) => (
                    <Card key={job.id} className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-2">
                                <div>
                                    <h2 className="text-lg font-semibold">{job.title}</h2>
                                    <p className="text-sm text-neutral-600">{job.location_text || "No location"}</p>
                                </div>
                                <p className="text-sm text-neutral-600">{job.description}</p>
                            </div>

                            <div className="text-sm text-neutral-600">
                                <p>Status: {job.status}</p>
                                <p>Pay: {job.pay_type} · {job.pay_amount}</p>
                                <p>Workers: {job.required_workers}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link href={`/jobs/${job.id}`}>
                                <Button variant="secondary">Open</Button>
                            </Link>
                            <Button onClick={() => handleApply(job.id)}>Apply</Button>
                        </div>
                    </Card>
                ))}

                {!loading && openJobs.length === 0 ? (
                    <Card>No open jobs match this search.</Card>
                ) : null}
            </div>
        </div>
    );
}