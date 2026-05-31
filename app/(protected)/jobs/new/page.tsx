"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createJob } from "@/lib/marketplace";
import { getToken } from "@/lib/session";
import { jobSchema, type JobFormValues } from "@/lib/validators";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export default function NewJobPage() {
    const router = useRouter();
    const token = getToken();
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<JobFormValues>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: "",
            description: "",
            location_text: "",
            required_workers: 1,
            pay_type: "daily",
            pay_amount: 0,
            start_date: "",
            end_date: "",
            start_time: "",
            end_time: "",
        },
    });

    async function onSubmit(values: JobFormValues) {
        setServerError("");

        try {
            await createJob(
                {
                    title: values.title,
                    description: values.description,
                    location_text: values.location_text || null,
                    required_workers: Number(values.required_workers),
                    pay_type: values.pay_type,
                    pay_amount: String(values.pay_amount),
                    start_date: values.start_date || null,
                    end_date: values.end_date || null,
                    start_time: values.start_time || null,
                    end_time: values.end_time || null,
                    required_skills: [],
                },
                token
            );

            router.push("/jobs");
        } catch (error) {
            setServerError(error instanceof Error ? error.message : "Job creation failed");
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
                <h1 className="text-2xl font-semibold tracking-tight">Create job</h1>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <Input placeholder="Title" {...register("title")} />
                        {errors.title ? <p className="mt-1 text-xs text-red-600">{errors.title.message}</p> : null}
                    </div>

                    <div>
                        <Textarea placeholder="Description" {...register("description")} />
                        {errors.description ? <p className="mt-1 text-xs text-red-600">{errors.description.message}</p> : null}
                    </div>

                    <Input placeholder="Location" {...register("location_text")} />
                    <Input placeholder="Required workers" {...register("required_workers")} />

                    <Select {...register("pay_type")}>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="fixed">Fixed</option>
                    </Select>

                    <Input placeholder="Pay amount" {...register("pay_amount")} />
                    <Input type="date" {...register("start_date")} />
                    <Input type="date" {...register("end_date")} />
                    <Input type="time" {...register("start_time")} />
                    <Input type="time" {...register("end_time")} />

                    {serverError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {serverError}
                        </div>
                    ) : null}

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create job"}
                    </Button>
                </form>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold">Creation notes</h2>
                <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                    <li>• Job starts in draft state.</li>
                    <li>• Publish it when ready.</li>
                    <li>• Add required skills later once skill management is wired.</li>
                </ul>
            </Card>
        </div>
    );
}