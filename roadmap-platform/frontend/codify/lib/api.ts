/**
 * Browser traffic should always go through the Next.js proxy so the app can be
 * deployed behind one origin and keep auth/cookies on the frontend domain.
 *
 * Server-side calls should use a server-only backend URL instead of a public
 * env var, because this is internal service-to-service configuration.
 */
const SERVER_API_BASE = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export const BACKEND_API =
  typeof window !== "undefined" ? "/api/backend" : SERVER_API_BASE;

export async function fetchBackend(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url =
    typeof window !== "undefined"
      ? `/api/backend${path}`
      : `${SERVER_API_BASE}${path}`;

  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}
