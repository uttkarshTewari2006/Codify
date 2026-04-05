"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Code2 } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="flex items-center justify-between px-8 py-5 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <Link href="/landing" className="text-xl font-semibold text-zinc-50 tracking-tight flex items-center gap-2">
                    <Code2 className="h-8 w-8 text-indigo-500" />
                    Codify
                </Link>
                <div className="hidden md:flex items-center gap-6 text-base font-medium text-zinc-400">
                    {status === "authenticated" ? (
                        <Link href="/dashboard" className="hover:text-zinc-100 transition-colors">
                            Dashboard
                        </Link>
                    ) : (
                        <Link href="/landing#features" className="hover:text-zinc-100 transition-colors">
                            Features
                        </Link>
                    )}
                    <Link href="/onboarding/roadmaps" className="hover:text-zinc-100 transition-colors">
                        Roadmaps
                    </Link>
                    <Link href="/onboarding" className="hover:text-zinc-100 transition-colors">
                        {status === "authenticated" ? "New Roadmap" : "Try Onboarding"}
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {status === "loading" ? (
                    <div className="h-9 w-24 bg-zinc-800/50 animate-pulse rounded-md" />
                ) : status === "authenticated" ? (
                    <>
                        <span className="text-base font-medium text-zinc-400 hidden sm:inline-block">
                            {session?.user?.email}
                        </span>
                        <Button variant="outline" onClick={() => signOut()} className="rounded-md font-medium border-zinc-800 bg-transparent hover:bg-zinc-900 text-zinc-300">
                            Sign out
                        </Button>
                    </>
                ) : (
                    <>
                        <Link href="/signin">
                            <Button variant="ghost" className="font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900">
                                Sign in
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md border-0">
                                Get Started
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
