"use client";

import { useEffect, useState, createElement } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getToken } from "@/lib/session";
import { getWorkerCandidates, assignWorkerToJob } from "@/lib/marketplace";
import type { WorkerProfile } from "@/types";
import { useAuthStore } from "@/store/auth-store";

type Props = {
  jobId: number;
  onAssigned?: () => void;
};

export function WorkerPicker({ jobId, onAssigned }: Props) {
  const token = useAuthStore((s) => s.token) || getToken();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("available");
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    if (!token) return;

    setLoading(true);
    setMessage("");

    try {
      const data = await getWorkerCandidates(
        jobId,
        {
          q: query || undefined,
          location_text: location || undefined,
          availability_status: availability || undefined,
          limit: 10,
        },
        token
      );

      setWorkers(data as WorkerProfile[]);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load workers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function assign(workerProfileId: number) {
    if (!token) return;
    setMessage("");

    try {
      await assignWorkerToJob(jobId, workerProfileId, token);
      setMessage("Worker assigned.");
      onAssigned?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Assignment failed");
    }
  }

  return createElement(
    Card,
    null,
    createElement("h2", { className: "text-lg font-semibold" }, "Search workers"),
    createElement(
      "p",
      { className: "mt-2 text-sm text-neutral-600" },
      "Search by name, bio, location, or skill readiness."
    ),
    createElement(
      "div",
      { className: "mt-4 grid gap-3 md:grid-cols-3" },
      createElement(Input, {
        placeholder: "Search",
        value: query,
        onChange: (e) => setQuery(e.target.value),
      }),
      createElement(Input, {
        placeholder: "Location",
        value: location,
        onChange: (e) => setLocation(e.target.value),
      }),
      createElement(
        Select,
        {
          value: availability,
          onChange: (e) => setAvailability(e.target.value),
        },
        createElement("option", { value: "available" }, "Available"),
        createElement("option", { value: "busy" }, "Busy"),
        createElement("option", { value: "offline" }, "Offline")
      )
    ),
    createElement(
      "div",
      { className: "mt-4 flex gap-3" },
      createElement(
        Button,
        { onClick: load, disabled: loading },
        loading ? "Searching..." : "Search"
      )
    ),
    message
      ? createElement("p", { className: "mt-4 text-sm text-neutral-600" }, message)
      : null,
    createElement(
      "div",
      { className: "mt-6 grid gap-3" },
      ...workers.map((worker) =>
        createElement(
          "div",
          {
            key: worker.id,
            className: "rounded-2xl border border-neutral-200 bg-neutral-50 p-4",
          },
          createElement(
            "div",
            {
              className:
                "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
            },
            createElement(
              "div",
              null,
              createElement(
                "p",
                { className: "font-medium" },
                worker.bio || `Worker #${worker.id}`
              ),
              createElement(
                "p",
                { className: "text-sm text-neutral-600" },
                worker.location_text || "No location",
                " · ",
                worker.availability_status,
                " · ",
                worker.hourly_expected_rate || "No rate"
              ),
              createElement(
                "p",
                { className: "mt-1 text-xs text-neutral-500" },
                `${worker.worker_skills?.length || 0} skills · ${worker.availability_blocks?.length || 0} availability slots`
              )
            ),
            createElement(
              Button,
              {
                variant: "secondary",
                onClick: () => assign(worker.id),
              },
              "Assign"
            )
          )
        )
      ),
      workers.length === 0 && !loading
        ? createElement("p", { className: "text-sm text-neutral-500" }, "No workers found.")
        : null
    )
  );
}