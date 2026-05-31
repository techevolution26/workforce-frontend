"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);

    if (!user) return null;

    const isEmployer = user.role === "employer";
    const isWorker = user.role === "worker";

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                        <p className="mt-2 text-sm text-neutral-600">
                            Welcome {user.full_name}. You are signed in as{" "}
                            <span className="font-medium text-neutral-900">{user.role}</span>.
                        </p>
                    </div>
                    <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                        {user.status}
                    </div>
                </div>
            </Card>

            {isEmployer ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <h2 className="font-medium">Employer hub</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Manage your company profile, hiring flow, and operational setup.
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
                        <h2 className="font-medium">Manage jobs</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Review drafts, open jobs, assignments, and cancellations.
                        </p>
                        <Link href="/employer/jobs" className="mt-4 inline-block">
                            <Button variant="secondary">My jobs</Button>
                        </Link>
                    </Card>
                </div>
            ) : null}

            {isWorker ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <h2 className="font-medium">Worker hub</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Update your profile, skills, and availability.
                        </p>
                        <Link href="/worker" className="mt-4 inline-block">
                            <Button variant="secondary">Open hub</Button>
                        </Link>
                    </Card>

                    <Card>
                        <h2 className="font-medium">Browse jobs</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Search work opportunities that match your skills and schedule.
                        </p>
                        <Link href="/jobs" className="mt-4 inline-block">
                            <Button variant="secondary">View jobs</Button>
                        </Link>
                    </Card>

                    <Card>
                        <h2 className="font-medium">Assignments</h2>
                        <p className="mt-2 text-sm text-neutral-600">
                            Track pending, accepted, and completed work.
                        </p>
                        <Link href="/applications" className="mt-4 inline-block">
                            <Button variant="secondary">Open assignments</Button>
                        </Link>
                    </Card>
                </div>
            ) : null}
        </div>
    );
}