"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getMyAssignments, acceptAssignment, rejectAssignment, startAssignment, completeAssignment, cancelAssignment } from "@/lib/marketplace";
import { getToken } from "@/lib/session";
import type { Assignment } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ApplicationsPage() {
    const token = useAuthStore((s) => s.token) || getToken();
    const user = useAuthStore((s) => s.user);

    const [items, setItems] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        if (!token) return;
        try {
            const data = await getMyAssignments(token);
            setItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadAssignments = async () => {
            await load();
        };
        loadAssignments();
    }, [token]);

    async function runAction(
        fn: (id: number, token?: string | null) => Promise<Assignment>,
        assignmentId: number
    ) {
        if (!token) return;
        try {
            await fn(assignmentId, token);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Action failed");
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
                <p className="mt-1 text-sm text-neutral-600">
                    Track work status and move assignments forward.
                </p>
            </div>

            {loading ? <Card>Loading assignments...</Card> : null}
            {error ? <Card className="border-red-200 text-red-700">{error}</Card> : null}

            <div className="grid gap-4">
                {items.map((assignment) => (
                    <Card key={assignment.id} className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="font-semibold">Assignment #{assignment.id}</h2>
                                <p className="text-sm text-neutral-600">
                                    Job ID: {assignment.job_id} · Status: {assignment.status}
                                </p>
                            </div>
                            {assignment.job ? (
                                <p className="text-sm text-neutral-600">{assignment.job.title}</p>
                            ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {user?.role === "worker" && assignment.status === "pending" ? (
                                <>
                                    <Button onClick={() => runAction(acceptAssignment, assignment.id)}>Accept</Button>
                                    <Button variant="secondary" onClick={() => runAction(rejectAssignment, assignment.id)}>Reject</Button>
                                </>
                            ) : null}

                            {assignment.status === "accepted" ? (
                                <>
                                    <Button variant="secondary" onClick={() => runAction(startAssignment, assignment.id)}>
                                        Start
                                    </Button>
                                    <Button onClick={() => runAction(completeAssignment, assignment.id)}>
                                        Complete
                                    </Button>
                                </>
                            ) : null}

                            {assignment.status !== "completed" ? (
                                <Button variant="danger" onClick={() => runAction(cancelAssignment, assignment.id)}>
                                    Cancel
                                </Button>
                            ) : null}
                        </div>
                    </Card>
                ))}

                {!loading && items.length === 0 ? <Card>No assignments yet.</Card> : null}
            </div>
        </div>
    );
}