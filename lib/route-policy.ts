import type { UserRole } from "@/types";

type RouteRule = {
  prefix: string;
  roles: UserRole[];
};

const ALL_ROLES: UserRole[] = ["worker", "employer", "admin"];

// ORDER MATTERS: Deepest sub-routes must come first so startsWith() matches accurately
const ROUTE_RULES: RouteRule[] = [
  { prefix: "/worker/assignments", roles: ["worker", "admin"] },
  { prefix: "/worker/jobs", roles: ["worker", "admin"] },
  { prefix: "/worker", roles: ["worker", "admin"] },
  { prefix: "/employer/assignments", roles: ["employer", "admin"] },
  { prefix: "/employer/jobs", roles: ["employer", "admin"] },
  { prefix: "/employer", roles: ["employer", "admin"] },
  { prefix: "/dashboard", roles: ALL_ROLES },
  { prefix: "/jobs", roles: ALL_ROLES },
  { prefix: "/applications", roles: ALL_ROLES },
];

export function isRouteAllowed(role: UserRole, pathname: string): boolean {
  const rule = ROUTE_RULES.find((item) => pathname.startsWith(item.prefix));
  return rule ? rule.roles.includes(role) : true;
}

export function getHomeRoute(role: UserRole): string {
  if (role === "admin") return "/dashboard";
  return `/${role}`;
}

export function getNavItems(role: UserRole) {
  // Base dashboard link accessible to everyone
  const nav = [{ href: "/dashboard", label: "Dashboard" }];

  if (role === "worker" || role === "admin") {
    nav.push(
      { href: "/worker", label: "Worker Hub" },
      { href: "/worker/jobs", label: "Open Jobs" },
      { href: "/worker/assignments", label: "My Assignments" }
    );
  }

  if (role === "employer" || role === "admin") {
    nav.push(
      { href: "/employer", label: "Employer Hub" },
      { href: "/jobs/new", label: "Create Job" },
      { href: "/employer/jobs", label: "My Jobs" },
      { href: "/employer/assignments", label: "Job Assignments" }
    );
  }

  return nav;
}
