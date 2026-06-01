import type { Assignment, AssignmentStatus, UserRole } from "@/types";

export type AssignmentBucket = "pending" | "active" | "completed" | "archived";

export function getAssignmentBucket(status: AssignmentStatus): AssignmentBucket {
    if (status === "pending") return "pending";
    if (status === "accepted") return "active";
    if (status === "completed") return "completed";
    return "archived";
}

export function getStatusLabel(status: AssignmentStatus): string {
    switch (status) {
        case "pending":
            return "Pending review";
        case "accepted":
            return "Accepted";
        case "rejected":
            return "Rejected";
        case "cancelled":
            return "Cancelled";
        case "completed":
            return "Completed";
        default:
            return status;
    }
}

export function getStatusTone(status: AssignmentStatus): string {
    switch (status) {
        case "pending":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "accepted":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "completed":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "rejected":
        case "cancelled":
            return "bg-neutral-100 text-neutral-600 border-neutral-200";
        default:
            return "bg-neutral-100 text-neutral-600 border-neutral-200";
    }
}

export function getTimelineSteps(status: AssignmentStatus) {
    const steps = [
        { key: "pending", label: "Requested", done: true, active: status === "pending" },
        { key: "accepted", label: "Accepted", done: ["accepted", "completed"].includes(status), active: status === "accepted" },
        { key: "started", label: "In progress", done: status === "completed", active: false },
        { key: "completed", label: "Completed", done: status === "completed", active: status === "completed" },
    ];

    return steps;
}

export function getAssignmentActions(role: UserRole, assignment: Assignment) {
    const actions: Array<"accept" | "reject" | "start" | "complete" | "cancel"> = [];

    if (assignment.status === "pending") {
        if (role === "worker") {
            actions.push("accept", "reject");
        }
        if (role === "employer" || role === "admin") {
            actions.push("cancel");
        }
    }

    if (assignment.status === "accepted") {
        if (role === "worker" || role === "employer" || role === "admin") {
            actions.push("start", "complete");
        }
        actions.push("cancel");
    }

    if (assignment.status === "completed") {
        return [];
    }

    if (assignment.status === "rejected" || assignment.status === "cancelled") {
        return [];
    }

    return actions;
}

export function groupAssignments(assignments: Assignment[]) {
    return {
        pending: assignments.filter((a) => getAssignmentBucket(a.status) === "pending"),
        active: assignments.filter((a) => getAssignmentBucket(a.status) === "active"),
        completed: assignments.filter((a) => getAssignmentBucket(a.status) === "completed"),
        archived: assignments.filter((a) => getAssignmentBucket(a.status) === "archived"),
    };
}