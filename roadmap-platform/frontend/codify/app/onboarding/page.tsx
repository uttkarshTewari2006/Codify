"use client";

import { Onboarding } from "@/components/Onboarding";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchBackend } from "@/lib/api";

export default function OnboardingPage() {
    const router = useRouter();

    const { update } = useSession();

    const handleComplete = async (data: any) => {
        console.log("Onboarding complete:", data);

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

                    if (genRes.ok) {
                        const data = await genRes.json();
                        if (data.roadmap_id) {
                            router.push(`/roadmaps/${data.roadmap_id}/edit`);
                        } else {
                            router.push("/dashboard");
                        }
                    } else {
                        console.error("Failed to generate AI plan");
                        router.push("/dashboard"); // Still go to dashboard, maybe it shows empty
                    }
                } catch (genError) {
                    console.error("Error calling generate-plan:", genError);
                    router.push("/dashboard");
                }
            } else {
                console.error("Failed to save onboarding status");
            }
        } catch (error) {
            console.error("Error saving onboarding status:", error);
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

                <Onboarding onComplete={handleComplete} />

                <p className="text-center text-sm text-slate-500">
                    You can always update these preferences later in your settings.
                </p>
            </div>
        </div>
    );
}
