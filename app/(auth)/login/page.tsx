"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { login, me } from "@/lib/auth";
import { setToken } from "@/lib/session";
import { loginSchema, type LoginFormValues } from "@/lib/validators";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next") || "/dashboard";

    const setSession = useAuthStore((s) => s.setSession);
    const [serverError, setServerError] = useState("");

    const {
        register: formRegister,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginFormValues) {
        setServerError("");

        try {
            const tokenResponse = await login(values);
            setToken(tokenResponse.access_token);

            const user = await me(tokenResponse.access_token);
            setSession(tokenResponse.access_token, user);

            if (user.role === "worker") router.push("/worker");
            else if (user.role === "employer") router.push("/employer");
            else router.push(nextPath);
        } catch (error) {
            setServerError(error instanceof Error ? error.message : "Login failed");
        }
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
            <Card className="w-full">
                <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Use your account credentials to continue.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <Input
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            {...formRegister("email")}
                        />
                        {errors.email ? (
                            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                        ) : null}
                    </div>

                    <div>
                        <Input
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            {...formRegister("password")}
                        />
                        {errors.password ? (
                            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                        ) : null}
                    </div>

                    {serverError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {serverError}
                        </div>
                    ) : null}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Login"}
                    </Button>
                </form>

                <p className="mt-6 text-sm text-neutral-600">
                    No account yet?{" "}
                    <Link href="/register" className="font-medium text-neutral-900 underline">
                        Create one
                    </Link>
                </p>
            </Card>
        </main>
    );
}