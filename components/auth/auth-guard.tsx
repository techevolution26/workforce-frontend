"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "@/types";
import { useAuthStore } from "@/store/auth-store";

type Props = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export function AuthGuard({ children, allowedRoles }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) return;

    if (status !== "authenticated" || !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
      router.replace("/dashboard?error=forbidden");
    }
  }, [allowedRoles, initialized, pathname, router, status, user]);

  if (!initialized || status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-neutral-50 px-6">
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-4 text-sm text-neutral-600 shadow-sm">
          Loading session...
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || !user) return null;
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}