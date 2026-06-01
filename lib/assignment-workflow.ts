import type { Assignment, AssignmentStatus, UserRole } from "@/types";

export type AssignmentPhase = "pending" | "active" | "completed" | "archived";

export function getAssignmentPhase(assignment: Assignment): AssignmentPhase {
  if (assignment.completed_at) return "completed";
  if (assignment.status === "rejected" || assignment.status === "cancelled") return "archived";
  if (assignment.started_at) return "active";
  if (assignment.status === "accepted") return "active";
  return "pending";
}

export function getAssignmentLabel(assignment: Assignment): string {
  if (assignment.completed_at) return "Completed";
  if (assignment.status === "rejected") return "Rejected";
  if (assignment.status === "cancelled") return "Cancelled";
  if (assignment.started_at) return "In progress";
  if (assignment.status === "accepted") return "Accepted";
  return "Pending review";
}

export function getAssignmentTone(assignment: Assignment): string {
  const phase = getAssignmentPhase(assignment);

  switch (phase) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "active":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "archived":
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }
}

export function getTimelineSteps(assignment: Assignment) {
  const phase = getAssignmentPhase(assignment);

  return [
    { key: "pending", label: "Requested", done: true, active: phase === "pending" },
    { key: "accepted", label: "Accepted", done: ["active", "completed"].includes(phase), active: phase === "pending" || phase === "active" },
    { key: "started", label: "In progress", done: ["active", "completed"].includes(phase), active: phase === "active" },
    { key: "completed", label: "Completed", done: phase === "completed", active: phase === "completed" },
  ];
}

export function getAssignmentActions(role: UserRole, assignment: Assignment) {
  const phase = getAssignmentPhase(assignment);
  const actions: Array<"accept" | "reject" | "start" | "complete" | "cancel"> = [];

  if (phase === "pending") {
    if (role === "worker") {
      actions.push("accept", "reject");
    }
    if (role === "employer" || role === "admin") {
      actions.push("cancel");
    }
    return actions;
  }

  if (phase === "active") {
    if (!assignment.started_at) {
      if (role === "worker" || role === "employer" || role === "admin") {
        actions.push("start");
      }
    }
    if (assignment.started_at && !assignment.completed_at) {
      if (role === "worker" || role === "employer" || role === "admin") {
        actions.push("complete");
      }
    }
    if (role === "worker" || role === "employer" || role === "admin") {
      actions.push("cancel");
    }
    return actions;
  }

  return actions;
}

export function groupAssignments(assignments: Assignment[]) {
  return {
    pending: assignments.filter((a) => getAssignmentPhase(a) === "pending"),
    active: assignments.filter((a) => getAssignmentPhase(a) === "active"),
    completed: assignments.filter((a) => getAssignmentPhase(a) === "completed"),
    archived: assignments.filter((a) => getAssignmentPhase(a) === "archived"),
  };
}