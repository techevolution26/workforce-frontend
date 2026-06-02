"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEmployerDashboard } from "@/lib/use-employer-dashboard";
import { JobRowCard } from "@/components/ui/JobRowCard";
import Link from "next/link";

export default function EmployerPage() {
  const {
    user,
    form,
    metrics,
    myJobs,
    loading,
    error,
    successMessage,
    isProfileComplete,
    handleProfileSubmit,
  } = useEmployerDashboard();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm font-medium text-neutral-500 animate-pulse">Initializing Hub Workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        <h3 className="font-semibold text-red-600">System Notification Error</h3>
        <p className="mt-1">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Workspace Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Employer Hub</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Operational Manager: <span className="font-medium text-neutral-700">{user?.full_name || "N/A"}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => router.push('/jobs/new')}>Create Job</Button>
            <Button variant="secondary" onClick={() => router.push('/employer/jobs')}>My Jobs</Button>
          </div>
        </div>
      </Card>

      {/* Verification Guard Alert */}
      {!isProfileComplete && (
        <Card className="border-amber-200 bg-amber-50/70 p-4">
          <div className="flex gap-3">
            <div>
              <h2 className="text-sm font-semibold text-amber-900">Action Required: Complete Organization Setup</h2>
              <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                Your organizational entity is registered, but critical metrics are missing. Provide company metrics below to enable public hiring capabilities.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Analytics Dashboard Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900 tracking-tight">{metric.count}</p>
          </Card>
        ))}
      </div>

      {/* Profile and Operations Split Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Entity Settings Form */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-neutral-900">Company Profile Information</h2>
          <p className="text-xs text-neutral-500 mb-6">Manage data details exposed to candidates.</p>

          <form className="space-y-4" onSubmit={form.handleSubmit(handleProfileSubmit)}>
            <div className="space-y-1">
              <Input placeholder="Legal Company Name" {...form.register("company_name")} />
              {form.formState.errors.company_name && (
                <p className="text-xs text-red-500">{form.formState.errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Input placeholder="Industry / Business Type" {...form.register("business_type")} />
            </div>

            <div className="space-y-1">
              <Input placeholder="Primary Point of Contact" {...form.register("contact_person")} />
            </div>

            <div className="space-y-1">
              <Input placeholder="Corporate Location Address" {...form.register("location_text")} />
            </div>

            <div className="space-y-1">
              <Textarea placeholder="Company Operational Overview Description" rows={4} {...form.register("description")} />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving Configuration..." : "Save Corporate Profile"}
              </Button>
              {successMessage && <p className="text-xs font-medium text-emerald-600">{successMessage}</p>}
            </div>
          </form>
        </Card>

        {/* Feature Permissions Column */}
        <Card className="p-6 h-fit bg-neutral-50/50">
          <h2 className="text-sm font-bold text-neutral-900 tracking-wide uppercase">Account Entitlements</h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-600">
            <li className="flex items-center gap-2">✔ Authorize and publish live jobs</li>
            <li className="flex items-center gap-2">✔ Audit operational assignments</li>
            <li className="flex items-center gap-2">✔ Monitor progress lifecycle metrics</li>
            <li className="flex items-center gap-2 text-neutral-400 italic">• Pipeline: Advanced applicant shortlisting</li>
          </ul>
        </Card>
      </div>

      {/* Operational Job Directory */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-neutral-900">Active Node Jobs</h2>
        <div className="mt-4 grid gap-4">
          {myJobs.map((job) => (
            <JobRowCard key={job.id} job={job} />
          ))}

          {myJobs.length === 0 && (
            <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center">
              <p className="text-sm text-neutral-400">No organizational positions found in index records.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Operational Fulfilment Assignments */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-neutral-900">Task Allocation Assignments</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Evaluate deployment statuses for contracted operators.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => router.push('/employer/assignments')}>Open Assignments Worklist</Button>
          <Button variant="secondary" onClick={() => router.push('/applications')}>View Complete Ledger</Button>
        </div>
      </Card>
    </div>
  );
}