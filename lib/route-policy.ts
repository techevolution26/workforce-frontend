import type { UserRole } from "@/types";

type RouteRule = {
  prefix: string;
  roles: UserRole[];
};

const ALL_ROLES: UserRole[] = ["worker", "employer", "admin"];

const ROUTE_RULES: RouteRule[] = [
  { prefix: "/dashboard", roles: ALL_ROLES },
  { prefix: "/jobs", roles: ALL_ROLES },
  { prefix: "/applications", roles: ALL_ROLES },
  { prefix: "/worker", roles: ["worker", "admin"] },
  { prefix: "/worker/assignments", roles: ["worker", "admin"] },
  { prefix: "/worker/jobs", roles: ["worker", "admin"] },
  { prefix: "/employer", roles: ["employer", "admin"] },
  { prefix: "/employer/assignments", roles: ["employer", "admin"] },
  { prefix: "/employer/jobs", roles: ["employer", "admin"] },
];

export function isRouteAllowed(role: UserRole, pathname: string): boolean {
  const rule = ROUTE_RULES.find((item) => pathname.startsWith(item.prefix));
  if (!rule) return true;
  return rule.roles.includes(role);
}

export function getHomeRoute(role: UserRole): string {
  if (role === "worker") return "/worker";
  if (role === "employer") return "/employer";
  return "/dashboard";
}

export function getNavItems(role: UserRole) {
  const common = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/jobs", label: "Jobs" },
    { href: "/applications", label: "Assignments" },
  ];

  if (role === "worker") {
    return [
      ...common,
      { href: "/worker", label: "Worker hub" },
      { href: "/worker/jobs", label: "Open jobs" },
      { href: "/worker/assignments", label: "My assignments" },
    ];
  }

  if (role === "employer") {
    return [
      ...common,
      { href: "/employer", label: "Employer hub" },
      { href: "/jobs/new", label: "Create job" },
      { href: "/employer/jobs", label: "My jobs" },
      { href: "/employer/assignments", label: "Job assignments" },
    ];
  }

  return [
    ...common,
    { href: "/worker", label: "Worker hub" },
    { href: "/employer", label: "Employer hub" },
  ];
}