"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { me } from "@/lib/auth";
import { getHomeRoute, isRouteAllowed } from "@/lib/route-policy";
import { getToken } from "@/lib/session";
import { useAuthStore } from "@/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status, initialized, setSession, clearSession, bootstrapDone, setStatus } =
    useAuthStore();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      clearSession();
      bootstrapDone();
      router.replace("/login");
      return;
    }

    setStatus("loading");

    me(token)
      .then((profile) => {
        setSession(token, profile);

        if (!isRouteAllowed(profile.role, pathname)) {
          router.replace(getHomeRoute(profile.role));
        }
      })
      .catch(() => {
        clearSession();
        router.replace("/login");
      })
      .finally(() => bootstrapDone());
  }, [bootstrapDone, clearSession, pathname, router, setSession, setStatus]);

  if (!initialized || status === "loading" || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-neutral-50 px-6">
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-4 text-sm text-neutral-600 shadow-sm">
          Loading session...
        </div>
      </div>
    );
  }

  if (!isRouteAllowed(user.role, pathname)) {
    return null;
  }

  return <>{children}</>;
}