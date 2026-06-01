"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";
import { getToken } from "@/lib/session";
import {
    acceptAssignment,
    applyForJob,
    cancelJob,
    getEmployerProfile,
    getJob,
    getJobAssignments,
    getMyAssignments,
    getSuggestedWorkers,
    getWorkerProfile,
    publishJob,
    rejectAssignment,
} from "@/lib/marketplace";
import type { Assignment, Job, WorkerProfile } from "@/types";
import { WorkerPicker } from "@/components/workers/worker-picker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JobDetailsPage() {
    const params = useParams<{ jobId: string }>();
    const token = useAuthStore((s) => s.token) || getToken();
    const user = useAuthStore((s) => s.user);

    const [job, setJob] = useState<Job | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
    const [suggestedWorkers, setSuggestedWorkers] = useState<WorkerProfile[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const jobId = Number(params.jobId);

    async function load() {
        if (!token || Number.isNaN(jobId)) return;

        setLoading(true);
        setMessage("");

        try {
            const [jobData, jobAssignments, suggestions] = await Promise.all([
                getJob(jobId),
                getJobAssignments(jobId, token),
                getSuggestedWorkers(jobId, token).catch(() => []),
            ]);

            setJob(jobData);
            setAssignments(jobAssignments);
            setSuggestedWorkers(suggestions as WorkerProfile[]);

            if (user?.role === "worker") {
                const mine = await getMyAssignments(token);
                setMyAssignments(mine.filter((a) => a.job_id === jobId));
            } else {
                setMyAssignments([]);
            }
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed to load job");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, jobId, user?.role]);

    const acceptedCount = useMemo(
        () => assignments.filter((a) => a.status === "accepted").length,
        [assignments]
    );

    const pendingCount = useMemo(
        () => assignments.filter((a) => a.status === "pending").length,
        [assignments]
    );

    const remainingWorkers = Math.max((job?.required_workers || 0) - acceptedCount, 0);

    const existingWorkerAssignment = myAssignments[0] || null;

    async function run(action: () => Promise<unknown>) {
        if (!token) return;
        try {
            await action();
            await load();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Action failed");
        }
    }

    if (loading || !job) {
        return <Card>Loading job...</Card>;
    }

    const isEmployer = user?.role === "employer" || user?.role === "admin";
    const isWorker = user?.role === "worker";
    const alreadyPublished = job.status !== "draft";

    return (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-6">
                <Card className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Job #{job.id}</p>
                            <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
                            <p className="mt-1 text-sm text-neutral-600">
                                {job.location_text || "No location"}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link href="/jobs">
                                <Button variant="secondary">Back to jobs</Button>
                            </Link>

                            {isEmployer ? (
                                <Link href="/employer/jobs">
                                    <Button variant="secondary">My jobs</Button>
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    <p className="text-sm leading-6 text-neutral-700">{job.description}</p>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Card className="bg-neutral-50">
                            <p className="text-xs uppercase tracking-wide text-neutral-500">Status</p>
                            <p className="mt-2 text-lg font-semibold">{job.status}</p>
                        </Card>
                        <Card className="bg-neutral-50">
                            <p className="text-xs uppercase tracking-wide text-neutral-500">Pay</p>
                            <p className="mt-2 text-lg font-semibold">{job.pay_type} · {job.pay_amount}</p>
                        </Card>
                        <Card className="bg-neutral-50">
                            <p className="text-xs uppercase tracking-wide text-neutral-500">Accepted</p>
                            <p className="mt-2 text-lg font-semibold">{acceptedCount}</p>
                        </Card>
                        <Card className="bg-neutral-50">
                            <p className="text-xs uppercase tracking-wide text-neutral-500">Remaining</p>
                            <p className="mt-2 text-lg font-semibold">{remainingWorkers}</p>
                        </Card>
                    </div>

                    {message ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {message}
                        </div>
                    ) : null}

                    <div className="flex flex-wrap gap-3">
                        {isWorker ? (
                            <Button
                                disabled={Boolean(existingWorkerAssignment)}
                                onClick={() => run(() => applyForJob(job.id, token))}
                            >
                                {existingWorkerAssignment
                                    ? existingWorkerAssignment.status === "rejected"
                                        ? "Already reviewed"
                                        : "Already applied"
                                    : "Apply for job"}
                            </Button>
                        ) : null}

                        {isEmployer ? (
                            <>
                                <Button
                                    variant="secondary"
                                    disabled={alreadyPublished}
                                    onClick={() => run(() => publishJob(job.id, token))}
                                >
                                    {alreadyPublished ? "Published" : "Publish"}
                                </Button>

                                <Button
                                    variant="danger"
                                    disabled={job.status === "completed" || job.status === "cancelled"}
                                    onClick={() => run(() => cancelJob(job.id, token))}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : null}
                    </div>
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold">Applicants</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        Pending applications: {pendingCount}
                    </p>

                    <div className="mt-4 grid gap-3">
                        {assignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="font-medium">
                                            Assignment #{assignment.id} · {assignment.status}
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            Worker profile ID {assignment.worker_profile_id}
                                        </p>
                                    </div>

                                    {isEmployer && assignment.status === "pending" ? (
                                        <div className="flex gap-2">
                                            <Button onClick={() => run(() => acceptAssignment(assignment.id, token))}>
                                                Accept
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => run(() => rejectAssignment(assignment.id, token))}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}

                        {assignments.length === 0 ? (
                            <p className="text-sm text-neutral-500">No one has applied yet.</p>
                        ) : null}
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                {isEmployer ? (
                    <Card>
                        <h2 className="text-lg font-semibold">Manage workers</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Search and assign workers, or manage incoming applications.
                        </p>

                        <div className="mt-4">
                            <WorkerPicker
                                jobId={job.id}
                                onAssigned={() => load()}
                            />
                        </div>
                    </Card>
                ) : null}

                <Card>
                    <h2 className="text-lg font-semibold">Current state</h2>
                    <div className="mt-4 space-y-2 text-sm text-neutral-600">
                        <p>Required workers: {job.required_workers}</p>
                        <p>Accepted: {acceptedCount}</p>
                        <p>Pending: {pendingCount}</p>
                        <p>Remaining: {remainingWorkers}</p>
                        <p>Published: {alreadyPublished ? "Yes" : "No"}</p>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold">Suggested workers</h2>
                    <div className="mt-4 space-y-3">
                        {suggestedWorkers.map((worker) => (
                            <div
                                key={worker.id}
                                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                            >
                                <p className="font-medium">{worker.bio || `Worker #${worker.id}`}</p>
                                <p className="text-sm text-neutral-600">
                                    {worker.location_text || "No location"} · {worker.availability_status}
                                </p>
                            </div>
                        ))}

                        {suggestedWorkers.length === 0 ? (
                            <p className="text-sm text-neutral-500">No suggestions yet.</p>
                        ) : null}
                    </div>
                </Card>
            </div>
        </div>
    );
}