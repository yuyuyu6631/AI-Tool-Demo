import type { MatchCandidate, MatchProfile } from "./catalog-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class MatchmakingApiError extends Error {
  status: number;

  constructor(path: string, status: number, message: string) {
    super(message || `Request failed for ${path} with status ${status}`);
    this.name = "MatchmakingApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const detail = payload && typeof payload === "object" && "detail" in payload ? payload.detail : null;
    const message = typeof detail === "string" ? detail : "请求失败，请稍后再试。";
    throw new MatchmakingApiError(path, response.status, message);
  }

  return payload as T;
}

export function fetchMyMatchProfile(): Promise<MatchProfile> {
  return request<MatchProfile>("/api/matchmaking/me", { method: "GET" });
}

export function updateMyMatchProfile(payload: { bio: string; isMatchmakingEnabled: boolean }): Promise<MatchProfile> {
  return request<MatchProfile>("/api/matchmaking/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function addMyToolUsage(toolId: number): Promise<MatchProfile> {
  return request<MatchProfile>("/api/matchmaking/me/tools", {
    method: "POST",
    body: JSON.stringify({ toolId }),
  });
}

export function removeMyToolUsage(toolId: number): Promise<MatchProfile> {
  return request<MatchProfile>(`/api/matchmaking/me/tools/${toolId}`, {
    method: "DELETE",
  });
}

export function fetchMyCandidates(limit = 20): Promise<MatchCandidate[]> {
  return request<MatchCandidate[]>(`/api/matchmaking/me/candidates?limit=${limit}`, { method: "GET" });
}

export { MatchmakingApiError };
