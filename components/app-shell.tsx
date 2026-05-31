"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/session";
import { getHomeRoute, getNavItems } from "@/lib/route-policy";
import { useAuthStore } from "@/store/auth-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  const navItems = user ? getNavItems(user.role) : [];

  function handleLogout() {
    clearToken();
    clearSession();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Link
                href={user ? getHomeRoute(user.role) : "/"}
                className="text-base font-semibold tracking-tight"
              >
                Workforce Marketplace
              </Link>
              <p className="truncate text-xs text-neutral-500">
                {user ? `${user.full_name} · ${user.role}` : "Signed out"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "shrink-0 rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}