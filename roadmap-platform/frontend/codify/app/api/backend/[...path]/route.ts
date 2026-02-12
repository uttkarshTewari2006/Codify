import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? ""
);

/**
 * Proxy to FastAPI: adds Authorization Bearer JWT (signed with user_id from session)
 * so FastAPI can authenticate the user. Call from client as fetch('/api/backend/tracks') etc.
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
    } catch (e) {
      console.error("[Proxy] JWT Signing Error:", e);
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
      // no body
    }
  }

  try {
    const res = await fetch(url, init);
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (error) {
    console.error("[Proxy] Fetch Error:", error);
    return new NextResponse(JSON.stringify({ error: "Backend unavailable" }), { status: 502 });
  }
}
