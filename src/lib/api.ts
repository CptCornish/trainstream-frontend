// src/lib/api.ts
// TODO: later we can restore the env-based config;
// for now, hard-code the Azure backend so the live site works.
const API_BASE_URL = "https://trainstream-backend-f3c6f0f8g8ftfkgy.uksouth-01.azurewebsites.net";


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
