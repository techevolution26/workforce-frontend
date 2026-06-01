"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getJobs, getMyAssignments } from "@/lib/marketplace";
import { useAuthStore } from "@/store/auth-store";
import { getToken } from "@/lib/session";
import type { Assignment, Job } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function JobsPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token) || getToken();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [jobsData, assignmentsData] = await Promise.all([
          getJobs(),
          user?.role === "worker" && token ? getMyAssignments(token) : Promise.resolve([]),
        ]);
        setJobs(jobsData);
        setMyAssignments(assignmentsData as Assignment[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, user?.role]);

  const assignmentByJobId = useMemo(() => {
    const map = new Map<number, Assignment>();
    for (const assignment of myAssignments) {
      map.set(assignment.job_id, assignment);
    }
    return map;
  }, [myAssignments]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
            <p className="mt-1 text-sm text-neutral-600">
              {user?.role === "worker"
                ? "Browse open work and track applications."
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
        {jobs.map((job) => {
          const myAssignment = assignmentByJobId.get(job.id);

          return (
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
                  {myAssignment ? (
                    <p className="mt-2 rounded-full bg-neutral-100 px-3 py-1 text-xs">
                      {myAssignment.status === "pending"
                        ? "Already applied"
                        : myAssignment.status === "accepted"
                          ? "Assigned"
                          : myAssignment.status}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/jobs/${job.id}`}>
                  <Button variant="secondary">
                    {user?.role === "worker" && myAssignment ? "View application" : "Open"}
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}

        {!loading && jobs.length === 0 ? <Card>No jobs yet.</Card> : null}
      </div>
    </div>
  );
}