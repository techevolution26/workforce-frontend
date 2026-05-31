import { apiFetch } from "@/lib/api";
import type { AuthUser, LoginPayload, RegisterPayload, TokenResponse } from "@/types";

export async function login(payload: LoginPayload) {
  return apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload) {
  return apiFetch<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function me(token?: string | null) {
  return apiFetch<AuthUser>("/auth/me", {
    method: "GET",
    token,
  });
}