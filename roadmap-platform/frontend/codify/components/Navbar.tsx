"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";

export function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
                    Codify
                </Link>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <Link href="#features" className="hover:text-blue-600 transition-colors">
                        Features
                    </Link>
                    <Link href="#roadmap" className="hover:text-blue-600 transition-colors">
                        Roadmaps
                    </Link>
                    <Link href="/onboarding" className="hover:text-blue-600 transition-colors">
                        Try Onboarding
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {status === "loading" ? (
                    <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-md" />
                ) : status === "authenticated" ? (
                    <>
                        <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">
                            {session?.user?.email}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => signOut()}>
                            Sign out
                        </Button>
                    </>
                ) : (
                    <>
                        <Link href="/signin">
                            <Button variant="ghost" size="sm" className="font-semibold">
                                Sign in
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm" className="font-semibold shadow-sm">
                                Get Started
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
