"use client";

import { useAuthStore } from "@/store/auth-store";
import { getToken } from "@/lib/session";
import { updateEmployerProfile } from "@/lib/marketplace";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { employerProfileSchema, type EmployerProfileFormValues } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

export default function EmployerPage() {
    const token = useAuthStore((s) => s.token) || getToken();
    const user = useAuthStore((s) => s.user);
    const [message, setMessage] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<EmployerProfileFormValues>({
        resolver: zodResolver(employerProfileSchema),
        defaultValues: {
            company_name: "",
            business_type: "",
            contact_person: "",
            location_text: "",
            description: "",
        },
    });

    async function onSubmit(values: EmployerProfileFormValues) {
        setMessage("");

        try {
            await updateEmployerProfile(
                {
                    company_name: values.company_name || null,
                    business_type: values.business_type || null,
                    contact_person: values.contact_person || null,
                    location_text: values.location_text || null,
                    description: values.description || null,
                },
                token
            );

            setMessage("Employer profile updated.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Update failed");
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
                <h1 className="text-2xl font-semibold tracking-tight">Employer profile</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    {user?.full_name} can manage company details here.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <Input placeholder="Company name" {...register("company_name")} />
                    <Input placeholder="Business type" {...register("business_type")} />
                    <Input placeholder="Contact person" {...register("contact_person")} />
                    <Input placeholder="Location" {...register("location_text")} />
                    <Textarea placeholder="Description" {...register("description")} />

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save profile"}
                    </Button>
                </form>

                {message ? <p className="mt-4 text-sm text-neutral-600">{message}</p> : null}
            </Card>

            <Card>
                <h2 className="text-lg font-semibold">Next employer features</h2>
                <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                    <li>• create jobs</li>
                    <li>• publish and cancel jobs</li>
                    <li>• manage assignments</li>
                    <li>• review worker performance</li>
                </ul>
            </Card>
        </div>
    );
}