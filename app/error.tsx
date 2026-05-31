"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="grid min-h-screen place-items-center px-4">
            <Card className="max-w-md text-center">
                <h1 className="text-2xl font-semibold">Something went wrong</h1>
                <p className="mt-2 text-sm text-neutral-600">{error.message}</p>
                <div className="mt-6 flex justify-center gap-3">
                    <Button onClick={reset}>Try again</Button>
                    <Link href="/">
                        <Button variant="secondary">Home</Button>
                    </Link>
                </div>
            </Card>
        </main>
    );
}