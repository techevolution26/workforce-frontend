import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Job } from "@/types";

export function JobRowCard({ job }: { job: Job }) {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 transition-hover hover:border-neutral-300">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="font-semibold text-neutral-900">{job.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                        {job.location_text || "Remote / Decentralised"} · <span className="font-medium text-neutral-700">{job.pay_type}</span> · <span className="font-medium text-neutral-700">{job.pay_amount}</span>
                    </p>
                </div>
                <span className="inline-self-start rounded-full border bg-neutral-50 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    {job.status}
                </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/jobs/${job.id}`} className="inline-flex h-8 items-center rounded-md border border-neutral-200 bg-neutral-100 px-3 text-sm font-medium text-neutral-900 hover:bg-neutral-200">
                    Inspect Route
                </Link>
                <Link href="/jobs/new" className="inline-flex h-8 items-center rounded-md border border-transparent px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100">
                    Clone Context
                </Link>
            </div>
        </div>
    );
}