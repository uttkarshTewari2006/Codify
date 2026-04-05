"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/landing";

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 shadow-sm hover:bg-zinc-800 transition-colors"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => signIn("linkedin", { callbackUrl })}
        className="w-full flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 shadow-sm hover:bg-zinc-800 transition-colors"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
        Continue with LinkedIn
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-zinc-900 px-2 text-zinc-500 uppercase font-medium tracking-wider">Or</span>
        </div>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const email = (form.elements.namedItem("email") as HTMLInputElement).value;
          const password = (form.elements.namedItem("password") as HTMLInputElement).value;

          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl
          });

          console.log("SignIn result:", result);

          if (result?.error) {
            alert("Invalid email or password");
          } else {
            console.log("Redirecting to:", callbackUrl);
            window.location.href = callbackUrl || "/landing";
          }
        }}
        className="space-y-3"
      >
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-md border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow placeholder:text-zinc-600"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full rounded-md border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow placeholder:text-zinc-600"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors border-0"
        >
          Sign in with Email
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="font-medium text-zinc-300 hover:text-indigo-400 transition-colors">
          Sign up
        </a>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-sans">
      <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50 mb-1">
          Welcome Back to Codify
        </h1>
        <p className="text-sm text-zinc-400 mb-6">
          Use Google, LinkedIn, or email to continue.
        </p>

        <Suspense fallback={<div className="text-center text-sm text-zinc-500">Loading auth options...</div>}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
