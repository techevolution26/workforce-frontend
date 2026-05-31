import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-neutral-600">
          The page you requested does not exist.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Go home</Button>
        </Link>
      </Card>
    </main>
  );
}