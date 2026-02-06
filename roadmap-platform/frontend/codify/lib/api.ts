/**
 * Call the FastAPI backend. Auth is handled by the Next.js proxy so the
 * session cookie is sent and the proxy adds the Bearer token for FastAPI.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Base URL for backend calls from the browser — use the proxy so cookies are sent */
export const BACKEND_API =
  typeof window !== "undefined" ? "/api/backend" : API_BASE;

/**
 * Fetch from the backend. In the browser, use the proxy (/api/backend) so
 * the session cookie is included and the server adds the JWT for FastAPI.
 */
export async function fetchBackend(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = typeof window !== "undefined" ? `/api/backend${path}` : `${API_BASE}${path}`;
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}

export { API_BASE };
