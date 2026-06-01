"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);

    if (!user) return null;

    const isEmployer = user.role === "employer";
    const isWorker = user.role === "worker";

    return (
        <div className="space-y-6">
            <Card>
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Welcome {user.full_name}. You are signed in as{" "}
                    <span className="font-medium text-neutral-900">{user.role}</span>.
                </p>
            </Card>

            {isEmployer ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <h2 className="font-medium">Employer hub</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Manage profile, job creation, and hiring operations.
                        </p>
                        <Link href="/employer" className="mt-4 inline-block">
                            <Button variant="secondary">Open hub</Button>
                        </Link>
                    </Card>

                    <Card>
                        <h2 className="font-medium">Create job</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Post a shift, project, or recurring engagement.
                        </p>
                        <Link href="/jobs/new" className="mt-4 inline-block">
                            <Button variant="secondary">New job</Button>
                        </Link>
                    </Card>

                    <Card>
                        <h2 className="font-medium">My jobs</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Review drafts, open jobs, assignments, and progress.
                        </p>
                        <Link href="/employer/jobs" className="mt-4 inline-block">
                            <Button variant="secondary">Open</Button>
                        </Link>
                    </Card>
                </div>
            ) : null}

            {isWorker ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <h2 className="font-medium">Worker hub</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Complete profile, skills, and availability setup.
                        </p>
                        <Link href="/worker" className="mt-4 inline-block">
                            <Button variant="secondary">Open hub</Button>
                        </Link>
                    </Card>

                    <Card>
                        <h2 className="font-medium">Open jobs</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Browse work opportunities and apply quickly.
                        </p>
                        <Link href="/worker/jobs" className="mt-4 inline-block">
                            <Button variant="secondary">Browse</Button>
                        </Link>
                    </Card>

                    <Card>
                        <h2 className="font-medium">Assignments</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Track pending, accepted, and completed work.
                        </p>
                        <Link href="/applications" className="mt-4 inline-block">
                            <Button variant="secondary">Open</Button>
                        </Link>
                    </Card>
                </div>
            ) : null}
        </div>
    );
}