"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { register as registerUser } from "@/lib/auth";
import { registerSchema, type RegisterFormValues } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [serverError, setServerError] = useState("");

    const {
        register: formRegister,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            full_name: "",
            email: "",
            phone: "",
            password: "",
            role: "worker",
        },
    });

    async function onSubmit(values: RegisterFormValues) {
        setServerError("");

        try {
            await registerUser({
                full_name: values.full_name,
                email: values.email,
                phone: values.phone || null,
                password: values.password,
                role: values.role,
            });

            router.push("/login");
        } catch (error) {
            setServerError(error instanceof Error ? error.message : "Registration failed");
        }
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
            <Card className="w-full">
                <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Register as a worker or employer.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <Input placeholder="Full name" {...formRegister("full_name")} />
                        {errors.full_name ? (
                            <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>
                        ) : null}
                    </div>

                    <div>
                        <Input type="email" placeholder="Email" {...formRegister("email")} />
                        {errors.email ? (
                            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                        ) : null}
                    </div>

                    <div>
                        <Input placeholder="Phone" {...formRegister("phone")} />
                    </div>

                    <div>
                        <Input type="password" placeholder="Password" {...formRegister("password")} />
                        {errors.password ? (
                            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                        ) : null}
                    </div>

                    <div>
                        <Select {...formRegister("role")}>
                            <option value="worker">Worker</option>
                            <option value="employer">Employer</option>
                        </Select>
                        {errors.role ? (
                            <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
                        ) : null}
                    </div>

                    {serverError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {serverError}
                        </div>
                    ) : null}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Register"}
                    </Button>
                </form>

                <p className="mt-6 text-sm text-neutral-600">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-neutral-900 underline">
                        Login
                    </Link>
                </p>
            </Card>
        </main>
    );
}