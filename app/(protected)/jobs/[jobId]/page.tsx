"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";
import { getToken } from "@/lib/session";
import {
    applyForJob,
    assignWorkerToJob,
    cancelJob,
    getJob,
    publishJob,
} from "@/lib/marketplace";
import type { Job } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JobDetailsPage() {
    const params = useParams<{ jobId: string }>();
    const token = useAuthStore((s) => s.token) || getToken();
    const user = useAuthStore((s) => s.user);

    const [job, setJob] = useState<Job | null>(null);
    const [message, setMessage] = useState("");
    const [workerProfileId, setWorkerProfileId] = useState("");

    useEffect(() => {
        getJob(Number(params.jobId))
            .then(setJob)
            .catch((err) => setMessage(err instanceof Error ? err.message : "Failed to load job"));
    }, [params.jobId]);

    if (!job) {
        return <Card>Loading job...</Card>;
    }

    async function run(action: () => Promise<Job>) {
        if (!token) return;
        setMessage("");
        try {
            const updated = await action();
            setJob(updated);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Action failed");
        }
    }

    const isEmployer = user?.role === "employer" || user?.role === "admin";
    const isWorker = user?.role === "worker";

    return (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <Card className="space-y-4">
                <div>
                    <p className="text-sm text-neutral-500">Job #{job.id}</p>
                    <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
                    <p className="mt-1 text-sm text-neutral-600">{job.location_text || "No location"}</p>
                </div>

                <p className="text-sm leading-6 text-neutral-700">{job.description}</p>

                <div className="grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
                    <div>Status: {job.status}</div>
                    <div>Pay: {job.pay_type} · {job.pay_amount}</div>
                    <div>Workers needed: {job.required_workers}</div>
                    <div>Dates: {job.start_date || "—"} to {job.end_date || "—"}</div>
                </div>

                {message ? <p className="text-sm text-neutral-600">{message}</p> : null}

                <div className="flex flex-wrap gap-3">
                    {isWorker ? (
                        <Button onClick={() => run(() => applyForJob(job.id, token))}>
                            Apply for job
                        </Button>
                    ) : null}

                    {isEmployer ? (
                        <>
                            <Button variant="secondary" onClick={() => run(() => publishJob(job.id, token))}>
                                Publish
                            </Button>
                            <Button variant="danger" onClick={() => run(() => cancelJob(job.id, token))}>
                                Cancel
                            </Button>
                        </>
                    ) : null}
                </div>
            </Card>

            <Card className="space-y-4">
                <h2 className="text-lg font-semibold">Employer action</h2>
                <p className="text-sm text-neutral-600">
                    Assign a worker by worker profile ID.
                </p>
                <Input
                    placeholder="Worker profile ID"
                    value={workerProfileId}
                    onChange={(e) => setWorkerProfileId(e.target.value)}
                />
                <Button
                    className="w-full"
                    onClick={() => run(() => assignWorkerToJob(job.id, Number(workerProfileId), token))}
                >
                    Assign worker
                </Button>

                <p className="text-xs text-neutral-500">
                    This will later become a searchable picker with availability and skill matching.
                </p>
            </Card>
        </div>
    );
}