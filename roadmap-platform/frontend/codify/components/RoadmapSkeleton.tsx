"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RoadmapSkeleton() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-12 w-3/4 bg-zinc-900/50 rounded-lg" />
                <Skeleton className="h-6 w-full bg-zinc-900/30 rounded-md" />
                <Skeleton className="h-6 w-5/6 bg-zinc-900/30 rounded-md" />
            </div>

            {/* Progress Bar Skeleton */}
            <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                    <Skeleton className="h-4 w-24 bg-zinc-900/40 rounded" />
                    <Skeleton className="h-4 w-12 bg-zinc-900/40 rounded" />
                </div>
                <Skeleton className="h-3 w-full bg-zinc-900/20 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500/20 animate-shimmer" style={{ width: '30%' }} />
                </Skeleton>
            </div>

            {/* Task List Skeleton */}
            <section className="space-y-8">
                <div className="flex items-center justify-between mb-8 pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-5 h-5 rounded-full bg-zinc-800" />
                        <Skeleton className="h-6 w-32 bg-zinc-800 rounded" />
                    </div>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-5 bg-zinc-900/20 border-zinc-800/50 flex items-center gap-5 relative overflow-hidden rounded-xl border-dashed">
                            <Skeleton className="w-12 h-12 rounded-xl bg-zinc-800 shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-5 w-48 bg-zinc-800 rounded" />
                                    <Skeleton className="h-5 w-16 bg-zinc-900 rounded" />
                                </div>
                                <Skeleton className="h-4 w-full bg-zinc-900/50 rounded" />
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
