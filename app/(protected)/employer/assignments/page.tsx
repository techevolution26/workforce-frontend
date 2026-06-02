"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { getToken } from "@/lib/session";
import {
  acceptAssignment,
  cancelAssignment,
  completeJob,
  deleteJob,
  getEmployerJobs,
  getJobAssignments,
  rejectAssignment,
} from "@/lib/marketplace";
import type { Assignment, Job } from "@/types";

export default function EmployerAssignmentsPage() {
  const token = useAuthStore((s) => s.token) || getToken();
  const user = useAuthStore((s) => s.user);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [assignmentsByJob, setAssignmentsByJob] = useState<Record<number, Assignment[]>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    if (!token) return;

    setLoading(true);
    setMessage("");

    try {
      const jobsData = await getEmployerJobs(token);
      setJobs(jobsData);

      const pairs = await Promise.all(
        jobsData.map(async (job) => {
          const assignments = await getJobAssignments(job.id, token).catch(() => []);
          return [job.id, assignments as Assignment[]] as const;
        })
      );

      setAssignmentsByJob(Object.fromEntries(pairs));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load employer jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function runAction(
    fn: (id: number, token?: string | null) => Promise<unknown>,
    id: number
  ) {
    if (!token) return;
    setMessage("");

    try {
      await fn(id, token);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Action failed");
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Employer jobs</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Manage applicants, accepted workers, and job closure from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/employer">
              <Button variant="secondary">Back to employer hub</Button>
            </Link>
            <Link href="/jobs/new">
              <Button>Create job</Button>
            </Link>
          </div>
        </div>
      </Card>

      {loading ? <Card>Loading employer jobs...</Card> : null}
      {message ? <Card className="border-red-200 text-red-700">{message}</Card> : null}

      <div className="grid gap-6">
        {jobs.map((job) => {
          const assignments = assignmentsByJob[job.id] || [];
          const applications = assignments.filter((a) => a.source === "application" && a.status === "pending");
          const invitations = assignments.filter((a) => a.source === "invitation" && a.status === "pending");
          const accepted = assignments.filter((a) => a.status === "accepted");
          const completed = assignments.filter((a) => a.status === "completed");
          const remaining = Math.max(job.required_workers - accepted.length, 0);

          const canMarkDone = remaining === 0 && job.status !== "completed" && job.status !== "cancelled";
          const canDelete = (job.status === "draft" || job.status === "cancelled") && assignments.every(
            (a) => a.status !== "pending" && a.status !== "accepted"
          );

          return (
            <Card key={job.id} className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{job.title}</h2>
                  <p className="text-sm text-neutral-600">
                    {job.location_text || "No location"} · {job.status}
                  </p>
                </div>

                <div className="text-sm text-neutral-600">
                  <p>Required: {job.required_workers}</p>
                  <p>Accepted: {accepted.length}</p>
                  <p>Remaining: {remaining}</p>
                  <p>Completed workers: {completed.length}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/jobs/${job.id}`}>
                  <Button variant="secondary">Open job</Button>
                </Link>

                <Button
                  variant="secondary"
                  disabled={!canMarkDone}
                  onClick={() => runAction(completeJob, job.id)}
                >
                  {job.status === "completed" ? "Already done" : "Mark as done"}
                </Button>

                <Button
                  variant="danger"
                  disabled={!canDelete}
                  onClick={() => runAction(deleteJob, job.id)}
                >
                  Delete
                </Button>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-medium">Applications</h3>

                  {applications.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium">
                            {assignment.worker_profile?.user?.full_name || `Worker #${assignment.worker_profile_id}`}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {assignment.worker_profile?.location_text || "No location"} ·{" "}
                            {assignment.worker_profile?.availability_status}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={() => runAction(acceptAssignment, assignment.id)}>
                            Accept
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => runAction(rejectAssignment, assignment.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {applications.length === 0 ? (
                    <p className="text-sm text-neutral-500">No pending applications.</p>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Invitations</h3>

                  {invitations.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium">
                            {assignment.worker_profile?.user?.full_name || `Worker #${assignment.worker_profile_id}`}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {assignment.worker_profile?.location_text || "No location"} · invitation pending
                          </p>
                        </div>

                        <Button
                          variant="secondary"
                          onClick={() => runAction(cancelAssignment, assignment.id)}
                        >
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  ))}

                  {invitations.length === 0 ? (
                    <p className="text-sm text-neutral-500">No open invitations.</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="font-medium">Accepted workers</h3>
                <div className="mt-3 grid gap-3">
                  {accepted.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4"
                    >
                      <div>
                        <p className="font-medium">
                          {assignment.worker_profile?.user?.full_name || `Worker #${assignment.worker_profile_id}`}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {assignment.started_at ? "In progress" : "Accepted"}
                        </p>
                      </div>

                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="secondary">Open job</Button>
                      </Link>
                    </div>
                  ))}

                  {accepted.length === 0 ? (
                    <p className="text-sm text-neutral-500">No accepted workers yet.</p>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}