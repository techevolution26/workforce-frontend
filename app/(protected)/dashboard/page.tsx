"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);

    return (
        <div className="space-y-6">
            <Card>
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Welcome {user?.full_name}. You are signed in as{" "}
                    <span className="font-medium text-neutral-900">{user?.role}</span>.
                </p>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <h2 className="font-medium">Worker profile</h2>
                    <p className="mt-2 text-sm text-neutral-600">
                        Manage skills, availability, and profile details.
                    </p>
                    <Link href="/worker" className="mt-4 inline-block">
                        <Button variant="secondary">Open</Button>
                    </Link>
                </Card>

                <Card>
                    <h2 className="font-medium">Employer profile</h2>
                    <p className="mt-2 text-sm text-neutral-600">
                        Manage company details and hiring preferences.
                    </p>
                    <Link href="/employer" className="mt-4 inline-block">
                        <Button variant="secondary">Open</Button>
                    </Link>
                </Card>

                <Card>
                    <h2 className="font-medium">Jobs & assignments</h2>
                    <p className="mt-2 text-sm text-neutral-600">
                        Browse jobs, create postings, and track assignments.
                    </p>
                    <Link href="/jobs" className="mt-4 inline-block">
                        <Button variant="secondary">Open</Button>
                    </Link>
                </Card>
            </div>
        </div>
    );
}