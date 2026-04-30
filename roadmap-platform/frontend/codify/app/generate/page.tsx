"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Onboarding, type OnboardingData } from "@/components/Onboarding";
import { RoadmapSkeleton } from "@/components/RoadmapSkeleton";
import { fetchBackend } from "@/lib/api";

interface GeneratePlanResponse {
    roadmap_id?: string;
    detail?: string;
    error?: string;
}

interface RoadmapSummary {
    id: string;
    title: string;
}

interface RoadmapDetailResponse {
    roadmap: RoadmapSummary;
}

export default function GeneratePage() {
    const router = useRouter();
    const [generating, setGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleComplete = async (data: OnboardingData) => {
        setErrorMessage(null);
        setGenerating(true);
        try {
            const genRes = await fetchBackend("/generate-plan", {
                method: "POST",
                body: JSON.stringify(data),
            });
            const genData = (await genRes.json().catch(() => null)) as GeneratePlanResponse | null;

            if (genRes.ok) {
                if (genData?.roadmap_id) {
                    try {
                        const [allRoadmapsRes, newRoadmapRes] = await Promise.all([
                            fetchBackend("/roadmaps"),
                            fetchBackend(`/roadmaps/${genData.roadmap_id}`)
                        ]);

                        if (allRoadmapsRes.ok && newRoadmapRes.ok) {
                            const allRoadmaps = (await allRoadmapsRes.json()) as RoadmapSummary[];
                            const newRoadmapData = (await newRoadmapRes.json()) as RoadmapDetailResponse;
                            const { roadmap: newRoadmap } = newRoadmapData;

                            const baseTitle = newRoadmap.title;
                            const existingTitles = allRoadmaps
                                .filter((r) => r.id !== genData.roadmap_id)
                                .map((r) => r.title);

                            if (existingTitles.includes(baseTitle)) {
                                let counter = 1;
                                let uniqueTitle = `${baseTitle} (${counter})`;
                                while (existingTitles.includes(uniqueTitle)) {
                                    counter++;
                                    uniqueTitle = `${baseTitle} (${counter})`;
                                }

                                await fetchBackend(`/roadmaps/${genData.roadmap_id}`, {
                                    method: "PATCH",
                                    body: JSON.stringify({ title: uniqueTitle })
                                });
                            }
                        }
                    } catch (error) {
                        console.error("Collision check failed:", error);
                    }

                    router.push(`/roadmaps/${genData.roadmap_id}/edit`);
                } else {
                    router.push("/dashboard");
                }
            } else {
                const detail = genData?.detail || genData?.error || "Failed to generate AI plan.";
                console.error("Failed to generate AI plan:", detail);
                setErrorMessage(detail);
            }
        } catch (error) {
            console.error("Error generating plan:", error);
            setErrorMessage("Could not reach the roadmap generator.");
        } finally {
            setGenerating(false);
        }
    };

    if (generating) {
        return (
            <div className="min-h-screen bg-zinc-950 font-sans p-6 overflow-hidden">
                <div className="max-w-4xl mx-auto space-y-6 pt-12 text-center flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <h2 className="text-xl font-medium tracking-tight text-zinc-100">Drafting your perfect plan...</h2>
                    <p className="text-sm text-zinc-400 mb-12">
                        Our AI Coach is analyzing your constraints and generating a personalized roadmap.
                    </p>
                </div>
                <div className="opacity-40 select-none pointer-events-none grayscale px-4 blur-[1px]">
                    <RoadmapSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 font-sans pb-12">
            {errorMessage && (
                <div className="mx-auto max-w-4xl px-6 pt-6">
                    <div className="rounded-md border border-rose-900 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
                        {errorMessage}
                    </div>
                </div>
            )}
            <Onboarding onComplete={handleComplete} />
        </div>
    );
}
