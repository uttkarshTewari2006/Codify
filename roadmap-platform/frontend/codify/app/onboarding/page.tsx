"use client";

import { Onboarding } from "@/components/Onboarding";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();

    const handleComplete = (data: any) => {
        console.log("Onboarding complete:", data);
        // In a real app, we would save this to the database
        // For now, redirect to dashboard
        router.push("/");
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
