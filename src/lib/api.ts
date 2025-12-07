// src/lib/api.ts
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return (await res.json()) as T;
}

// Example helpers:
export function login(username: string, password: string) {
  return request<{ access_token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function getCourses() {
  return request<any[]>("/api/courses/");
}

// add other endpoints here, e.g. getUsers, getTemplates, etc.
