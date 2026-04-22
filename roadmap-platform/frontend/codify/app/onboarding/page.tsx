"use client";

import { Onboarding } from "@/components/Onboarding";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchBackend } from "@/lib/api";
import { useState } from "react";

export default function OnboardingPage() {
    const router = useRouter();
    const { update } = useSession();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleComplete = async (data: any) => {
        console.log("Onboarding complete:", data);
        setErrorMessage(null);

        try {
            const res = await fetch("/api/user/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                // Update session to reflect onboarded status
                await update({ onboarded: true });

                // Trigger AI Roadmap Generation (Backend)
                try {
                    console.log("Triggering AI roadmap generation...");
                    const genRes = await fetchBackend("/generate-plan", {
                        method: "POST",
                        body: JSON.stringify(data),
                    });
                    const genData = await genRes.json().catch(() => null);

                    if (genRes.ok) {
                        if (genData?.roadmap_id) {
                            router.push(`/roadmaps/${genData.roadmap_id}/edit`);
                        } else {
                            router.push("/dashboard");
                        }
                    } else {
                        const detail = genData?.detail || genData?.error || "Failed to generate AI plan.";
                        console.error("Failed to generate AI plan:", detail);
                        setErrorMessage(detail);
                    }
                } catch (genError) {
                    console.error("Error calling generate-plan:", genError);
                    setErrorMessage("Could not reach the roadmap generator.");
                }
            } else {
                console.error("Failed to save onboarding status");
                setErrorMessage("Failed to save onboarding status.");
            }
        } catch (error) {
            console.error("Error saving onboarding status:", error);
            setErrorMessage("Error saving onboarding status.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                        Ready to level up?
                    </h1>
                    <p className="mt-4 text-xl text-slate-600">
                        A few questions to build your customized roadmap.
                    </p>
                </div>

                {errorMessage && (
                    <div className="mx-auto max-w-2xl rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {errorMessage}
                    </div>
                )}

                <Onboarding onComplete={handleComplete} />

                <p className="text-center text-sm text-slate-500">
                    You can always update these preferences later in your settings.
                </p>
            </div>
        </div>
    );
}
