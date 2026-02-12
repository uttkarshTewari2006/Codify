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
                    router.push("/");
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    Create New Account
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    Sign up to get started with Codify.
                </p>

                {error && (
                    <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        name="name"
                        type="text"
                        placeholder="Full Name (Optional)"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                    />
                    <p className="text-xs text-gray-500">
                        Password must be at least 8 characters, include a number, an uppercase letter, and a special character.
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Create My Account"}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <a href="/signin" className="font-medium text-gray-900 hover:underline">
                        Sign in
                    </a>
                </div>
            </div>
        </div>
    );
}
