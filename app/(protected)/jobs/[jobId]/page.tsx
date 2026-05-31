"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
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
import { getToken } from "@/lib/session";

export default function JobDetailsPage() {
    const params = useParams<{ jobId: string }>();
    const router = useRouter();
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

    async function handleApply() {
        if (!token) return;
        try {
            await applyForJob(Number(params.jobId), token);
            setMessage("Applied successfully.");
            router.refresh();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Application failed");
        }
    }

    async function handlePublish() {
        if (!token) return;
        try {
            const updated = await publishJob(Number(params.jobId), token);
            setJob(updated);
            setMessage("Job published.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Publish failed");
        }
    }

    async function handleCancel() {
        if (!token) return;
        try {
            const updated = await cancelJob(Number(params.jobId), token);
            setJob(updated);
            setMessage("Job cancelled.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Cancel failed");
        }
    }

    async function handleAssign() {
        if (!token || !workerProfileId) return;
        try {
            await assignWorkerToJob(Number(params.jobId), Number(workerProfileId), token);
            setMessage("Worker assigned.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Assignment failed");
        }
    }

    if (!job) {
        return <Card>Loading job...</Card>;
    }

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

                <div>
                    <h2 className="text-lg font-semibold">Required skills</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {job.required_skills.length > 0 ? (
                            job.required_skills.map((skill) => (
                                <span key={skill.id} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                                    Skill #{skill.skill_id} {skill.required_level ? `· Level ${skill.required_level}` : ""}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-neutral-500">No required skills set</span>
                        )}
                    </div>
                </div>

                {message ? <p className="text-sm text-neutral-600">{message}</p> : null}

                <div className="flex flex-wrap gap-3">
                    {user?.role === "worker" ? <Button onClick={handleApply}>Apply for job</Button> : null}
                    {(user?.role === "employer" || user?.role === "admin") ? (
                        <>
                            <Button variant="secondary" onClick={handlePublish}>Publish</Button>
                            <Button variant="danger" onClick={handleCancel}>Cancel</Button>
                        </>
                    ) : null}
                </div>
            </Card>

            <Card className="space-y-4">
                <h2 className="text-lg font-semibold">Employer actions</h2>
                <p className="text-sm text-neutral-600">
                    Assign a worker by profile ID.
                </p>
                <Input
                    placeholder="Worker profile ID"
                    value={workerProfileId}
                    onChange={(e) => setWorkerProfileId(e.target.value)}
                />
                <Button onClick={handleAssign} className="w-full">
                    Assign worker
                </Button>

                <p className="text-xs text-neutral-500">
                    In production, this would usually be replaced by a searchable worker picker.
                </p>
            </Card>
        </div>
    );
}