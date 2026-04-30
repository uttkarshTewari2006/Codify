import type { DefaultSession } from "next-auth";
import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    onboarded?: boolean;
    isAdmin?: boolean;
  }

  interface Session {
    onboarded?: boolean;
    user: DefaultSession["user"] & {
      id?: string;
      onboarded?: boolean;
      isAdmin?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user_id?: string;
    email?: string;
    onboarded?: boolean;
    isAdmin?: boolean;
  }
}
