/**
 * Browser traffic should always go through the Next.js proxy so the app can be
 * deployed behind one origin and keep auth/cookies on the frontend domain.
 *
 * Server-side calls should use a server-only backend URL instead of a public
 * env var, because this is internal service-to-service configuration.
 */
function getServerApiBase(): string {
  const apiBase = process.env.BACKEND_API_URL?.trim();
  if (!apiBase) {
    throw new Error("BACKEND_API_URL must be configured for server-side backend calls.");
  }

  return apiBase.replace(/\/+$/, "");
}

export const BACKEND_API =
  typeof window !== "undefined"
    ? "/api/backend"
    : process.env.BACKEND_API_URL?.trim().replace(/\/+$/, "") ?? "";

export async function fetchBackend(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url =
    typeof window !== "undefined"
      ? `/api/backend${path}`
      : `${getServerApiBase()}${path}`;

  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}
