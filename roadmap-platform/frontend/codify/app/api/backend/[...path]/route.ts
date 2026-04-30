import { getToken } from "next-auth/jwt";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.BACKEND_API_URL ?? "http://localhost:8000";
const SHARED_AUTH_SECRET = process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET ?? "";
const JWT_SECRET = new TextEncoder().encode(SHARED_AUTH_SECRET);

/**
 * Proxy all browser-originated backend traffic through Next.js so the frontend
 * can stay on one public origin while the backend URL remains internal.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyWithAuth("GET", context.params, req);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyWithAuth("POST", context.params, req);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyWithAuth("PUT", context.params, req);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyWithAuth("PATCH", context.params, req);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyWithAuth("DELETE", context.params, req);
}

async function proxyWithAuth(
  method: string,
  params: Promise<{ path: string[] }>,
  req?: NextRequest
) {
  const { path } = await params;
  const pathStr = path.length ? path.join("/") : "";
  const url = `${API_BASE}/${pathStr}${req?.nextUrl.search ?? ""}`;

  const token = req
    ? await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    : null;

  let authHeader: string | undefined;
  if (token?.user_id && JWT_SECRET.length) {
    try {
      const jwt = await new SignJWT({ user_id: token.user_id })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(JWT_SECRET);
      authHeader = `Bearer ${jwt}`;
    } catch (error) {
      console.error("[Proxy] JWT signing error:", error);
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(authHeader && { Authorization: authHeader }),
  };

  const init: RequestInit = { method, headers };
  if (req && (method === "POST" || method === "PUT" || method === "PATCH")) {
    try {
      const body = await req.text();
      if (body) init.body = body;
    } catch {
      // No request body.
    }
  }

  try {
    const res = await fetch(url, init);
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("[Proxy] Fetch error:", error);
    return new NextResponse(JSON.stringify({ error: "Backend unavailable" }), {
      status: 502,
    });
  }
}
