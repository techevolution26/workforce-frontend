import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center">
        <section className="space-y-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
            Labor marketplace
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Hire skilled and general workers for short or long-term work.
          </h1>
          <p className="max-w-xl text-base leading-7 text-neutral-600">
            Built for factories, hotels, plumbing, electrical work, cleaning,
            loading, and other hands-on jobs that need fast staffing.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button>Create account</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </div>
        </section>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">What the platform does</h2>
          <div className="grid gap-3 text-sm text-neutral-600">
            <div className="rounded-2xl bg-neutral-50 p-4">Worker profiles with skills and availability.</div>
            <div className="rounded-2xl bg-neutral-50 p-4">Employer job postings and assignments.</div>
            <div className="rounded-2xl bg-neutral-50 p-4">Role-aware dashboards and protected routes.</div>
            <div className="rounded-2xl bg-neutral-50 p-4">FastAPI backend integration with typed API calls.</div>
          </div>
        </Card>
      </div>
    </main>
  );
}