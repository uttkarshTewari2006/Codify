"use client";

import { Navbar } from "@/components/Navbar";
import { CuratedRoadmapsDisplay } from "@/components/CuratedRoadmapsDisplay";
import { Star, TrendingUp } from "lucide-react";

export default function RoadmapsPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
            <Navbar />

            <main className="container mx-auto px-6 py-16 max-w-5xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-indigo-500/20 bg-indigo-500/10 mb-6">
                        <Star className="h-4 w-4 text-indigo-400" />
                        <span className="text-xs font-medium text-indigo-300 uppercase tracking-wider">Curated Paths</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                        Explore Learning Roadmaps
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Choose an expertly crafted track or build your own AI-generated curriculum based on your unique goals.
                    </p>
                </div>

                <div className="space-y-12">
                    <CuratedRoadmapsDisplay />
                </div>

                {/* Additional Call to Action for Custom Generation */}
                <div className="mt-20 p-10 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 mb-6 border border-zinc-700">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-medium text-zinc-100 mb-3">
                            Need something tailored?
                        </h2>
                        <p className="text-zinc-400 max-w-lg mb-8">
                            Take our 2-minute assessment and let our AI assemble the perfect roadmap for your exact skill level and target roles.
                        </p>
                        <a 
                            href="/generate" 
                            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm h-11 px-6 font-medium transition-colors"
                        >
                            Generate Custom Plan
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
