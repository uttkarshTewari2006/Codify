"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const name = formData.get("name") as string;

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            });

            if (res.ok) {
                // Auto-login after successful registration
                const result = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                });

                if (result?.error) {
                    setError("Registration successful, but login failed. Please sign in manually.");
                    router.push("/signin");
                } else {
                    router.push("/landing");
                }
            } else {
                const data = await res.json();
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-sans text-zinc-50">
            <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
                <h1 className="text-xl font-semibold tracking-tight text-zinc-50 mb-1">
                    Create New Account
                </h1>
                <p className="text-sm text-zinc-400 mb-6">
                    Sign up to get started with Codify.
                </p>

                {error && (
                    <div className="mb-4 p-3 text-sm text-rose-400 bg-rose-500/10 rounded-md border border-rose-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="name"
                        type="text"
                        placeholder="Full Name (Optional)"
                        className="w-full rounded-md border border-zinc-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        className="w-full rounded-md border border-zinc-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
                    />
                    <div>
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            required
                            className="w-full rounded-md border border-zinc-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
                        />
                        <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
                            Password must be at least 8 characters, include a number, an uppercase letter, and a special character.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 mt-2 text-center border-0"
                    >
                        {loading ? "Creating Account..." : "Create My Account"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-zinc-500">
                    Already have an account?{" "}
                    <a href="/signin" className="font-medium text-zinc-300 hover:text-indigo-400 transition-colors">
                        Sign in
                    </a>
                </div>
            </div>
        </div>
    );
}
