"use client";

import { create } from "zustand";
import type { AuthUser } from "@/types";
import { clearToken, setToken as saveToken } from "@/lib/session";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  initialized: boolean;
  setSession: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  bootstrapDone: () => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  status: "loading",
  initialized: false,
  setSession: (token, user) => {
    saveToken(token);
    set({ token, user, status: "authenticated", initialized: true });
  },
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  bootstrapDone: () => set({ initialized: true }),
  clearSession: () => {
    clearToken();
    set({ user: null, token: null, status: "unauthenticated", initialized: true });
  },
}));