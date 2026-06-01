"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { getToken } from "@/lib/session";
import {
    acceptAssignment,
    cancelAssignment,
    completeAssignment,
    getMyAssignments,
    rejectAssignment,
    startAssignment,
} from "@/lib/marketplace";
import type { Assignment } from "@/types";
import {
    getAssignmentActions,
    getAssignmentLabel,
    getAssignmentTone,
    getTimelineSteps,
    groupAssignments,
} from "@/lib/assignment-workflow";

const SECTION_ORDER: Array<"pending" | "active" | "completed" | "archived"> = [
    "pending",
    "active",
    "completed",
    "archived",
];

export function AssignmentsPage() {
    const token = useAuthStore((s) => s.token) || getToken();
    const user = useAuthStore((s) => s.user);

    const [items, setItems] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [query, setQuery] = useState("");

    async function load() {
        if (!token) return;

        setLoading(true);
        setMessage("");

        try {
            const data = await getMyAssignments(token);
            setItems(data);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Failed to load assignments");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await load();
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    async function runAction(
        fn: (id: number, token?: string | null) => Promise<Assignment>,
        assignmentId: number
    ) {
        if (!token) return;

        setMessage("");

        try {
            await fn(assignmentId, token);
            await load();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Action failed");
        }
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;

        return items.filter((assignment) => {
            const jobTitle = assignment.job?.title?.toLowerCase() || "";
            const jobLocation = assignment.job?.location_text?.toLowerCase() || "";
            const status = assignment.status.toLowerCase();

            return (
                jobTitle.includes(q) ||
                jobLocation.includes(q) ||
                status.includes(q) ||
                String(assignment.job_id).includes(q) ||
                String(assignment.id).includes(q)
            );
        });
    }, [items, query]);

    const grouped = useMemo(() => groupAssignments(filtered), [filtered]);

    const counts = useMemo(
        () => ({
            pending: grouped.pending.length,
            active: grouped.active.length,
            completed: grouped.completed.length,
            archived: grouped.archived.length,
            total: filtered.length,
        }),
        [filtered.length, grouped]
    );

    if (!user) return null;

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
                        <p className="mt-1 text-sm text-neutral-600">
                            {user.role === "worker"
                                ? "Track work offers, accepted jobs, and completed shifts."
                                : "Track the work assigned through your jobs."}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link href={user.role === "worker" ? "/worker" : "/employer"}>
                            <Button variant="secondary">Back to hub</Button>
                        </Link>
                        <Link href="/jobs">
                            <Button variant="secondary">Browse jobs</Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-4">
                    <Input
                        placeholder="Search by job title, location, assignment id, or status"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <p className="text-sm text-neutral-500">Pending</p>
                    <p className="mt-2 text-3xl font-semibold">{counts.pending}</p>
                </Card>
                <Card>
                    <p className="text-sm text-neutral-500">Active</p>
                    <p className="mt-2 text-3xl font-semibold">{counts.active}</p>
                </Card>
                <Card>
                    <p className="text-sm text-neutral-500">Completed</p>
                    <p className="mt-2 text-3xl font-semibold">{counts.completed}</p>
                </Card>
                <Card>
                    <p className="text-sm text-neutral-500">Archived</p>
                    <p className="mt-2 text-3xl font-semibold">{counts.archived}</p>
                </Card>
            </div>

            {loading ? <Card>Loading assignments...</Card> : null}
            {message ? <Card className="border-red-200 text-red-700">{message}</Card> : null}

            {SECTION_ORDER.map((section) => {
                const sectionItems = grouped[section];

                return (
                    <div key={section} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold capitalize">{section}</h2>
                            <span className="text-sm text-neutral-500">{sectionItems.length} items</span>
                        </div>

                        <div className="grid gap-4">
                            {sectionItems.map((assignment) => {
                                const steps = getTimelineSteps(assignment);
                                const actions = getAssignmentActions(user.role, assignment);

                                return (
                                    <Card key={assignment.id} className="space-y-5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-lg font-semibold">
                                                            {assignment.job?.title || `Assignment #${assignment.id}`}
                                                        </h3>

                                                        <span
                                                            className={[
                                                                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                                                                getAssignmentTone(assignment),
                                                            ].join(" ")}
                                                        >
                                                            {getAssignmentLabel(assignment)}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-sm text-neutral-600">
                                                        Assignment #{assignment.id} · Job #{assignment.job_id}
                                                    </p>
                                                </div>

                                                <p className="text-sm text-neutral-600">
                                                    {assignment.job?.location_text || "No location"} ·{" "}
                                                    {assignment.job?.pay_type || "n/a"} ·{" "}
                                                    {assignment.job?.pay_amount || "n/a"}
                                                </p>
                                            </div>

                                            {assignment.job ? (
                                                <Link href={`/jobs/${assignment.job.id}`}>
                                                    <Button variant="secondary">Open job</Button>
                                                </Link>
                                            ) : null}
                                        </div>

                                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                                            <div className="flex flex-wrap gap-3">
                                                {steps.map((step) => (
                                                    <div
                                                        key={step.key}
                                                        className={[
                                                            "min-w-[120px] rounded-2xl border px-3 py-2 text-xs font-medium",
                                                            step.done
                                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                : step.active
                                                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                                                    : "border-neutral-200 bg-white text-neutral-500",
                                                        ].join(" ")}
                                                    >
                                                        <div className="text-[11px] uppercase tracking-wide">
                                                            {step.label}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {actions.includes("accept") ? (
                                                <Button onClick={() => runAction(acceptAssignment, assignment.id)}>
                                                    Accept
                                                </Button>
                                            ) : null}

                                            {actions.includes("reject") ? (
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => runAction(rejectAssignment, assignment.id)}
                                                >
                                                    Reject
                                                </Button>
                                            ) : null}

                                            {actions.includes("start") ? (
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => runAction(startAssignment, assignment.id)}
                                                >
                                                    Start
                                                </Button>
                                            ) : null}

                                            {actions.includes("complete") ? (
                                                <Button onClick={() => runAction(completeAssignment, assignment.id)}>
                                                    Complete
                                                </Button>
                                            ) : null}

                                            {actions.includes("cancel") ? (
                                                <Button
                                                    variant="danger"
                                                    onClick={() => runAction(cancelAssignment, assignment.id)}
                                                >
                                                    Cancel
                                                </Button>
                                            ) : null}
                                        </div>
                                    </Card>
                                );
                            })}

                            {sectionItems.length === 0 ? (
                                <Card>
                                    <p className="text-sm text-neutral-500">No {section} assignments.</p>
                                </Card>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}