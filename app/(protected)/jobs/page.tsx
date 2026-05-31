"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getJobs } from "@/lib/marketplace";
import { useAuthStore } from "@/store/auth-store";
import type { Job } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function JobsPage() {
  const user = useAuthStore((s) => s.user);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load jobs"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
            <p className="mt-1 text-sm text-neutral-600">
              {user?.role === "worker"
                ? "Browse open work and apply quickly."
                : "Review available jobs across the platform."}
            </p>
          </div>

          {user?.role === "employer" || user?.role === "admin" ? (
            <Link href="/jobs/new">
              <Button>Create job</Button>
            </Link>
          ) : null}
        </div>
      </Card>

      {loading ? <Card>Loading jobs...</Card> : null}
      {error ? <Card className="border-red-200 text-red-700">{error}</Card> : null}

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
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

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/jobs/${job.id}`}>
                <Button variant="secondary">Open</Button>
              </Link>

              {user?.role === "worker" ? (
                <span className="rounded-full bg-neutral-100 px-3 py-2 text-xs text-neutral-600">
                  Apply from details page
                </span>
              ) : null}
            </div>
          </Card>
        ))}

        {!loading && jobs.length === 0 ? <Card>No jobs yet.</Card> : null}
      </div>
    </div>
  );
}