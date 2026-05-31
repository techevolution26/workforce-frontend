"use client";

import { useEffect } from "react";
import { me } from "@/lib/auth";
import { getToken } from "@/lib/session";
import { useAuthStore } from "@/store/auth-store";

export function SessionBootstrap() {
  const { setSession, clearSession, setStatus, bootstrapDone } = useAuthStore();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      clearSession();
      bootstrapDone();
      return;
    }

    setStatus("loading");

    me(token)
      .then((user) => setSession(token, user))
      .catch(() => clearSession())
      .finally(() => bootstrapDone());
  }, [bootstrapDone, clearSession, setSession, setStatus]);

  return null;
}