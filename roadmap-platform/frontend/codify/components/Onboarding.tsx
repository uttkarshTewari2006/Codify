"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Slider } from "./ui/slider";
import { Textarea } from "./ui/textarea";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface OnboardingData {
    level: string;
    targetRole: string;
    timeline: string;
    hoursPerWeek: number;
    weaknesses: string[];
    topicConfidence: {
        arrays: number;
        graphs: number;
        dp: number;
        systemDesign: number;
    };
    constraints: string;
    pastExperience: string;
}

interface OnboardingProps {
    onComplete: (data: OnboardingData) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<OnboardingData>({
        level: "",
        targetRole: "",
        timeline: "",
        hoursPerWeek: 10,
        weaknesses: [],
        topicConfidence: {
            arrays: 50,
            graphs: 50,
            dp: 50,
            systemDesign: 50,
        },
        constraints: "",
        pastExperience: "",
    });

    const updateData = (field: string, value: any) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleWeakness = (weakness: string) => {
        setData((prev) => ({
            ...prev,
            weaknesses: prev.weaknesses.includes(weakness)
                ? prev.weaknesses.filter((w) => w !== weakness)
                : [...prev.weaknesses, weakness],
        }));
    };

    const updateTopicConfidence = (topic: keyof OnboardingData["topicConfidence"], value: number) => {
        setData((prev) => ({
            ...prev,
            topicConfidence: { ...prev.topicConfidence, [topic]: value },
        }));
    };

    const canProceed = () => {
        switch (step) {
            case 0:
                return data.level !== "";
            case 1:
                return true;
            case 2:
                return data.targetRole !== "" && data.timeline !== "";
            case 3:
                return data.weaknesses.length > 0;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            onComplete(data);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    return (
        <div className="flex items-center justify-center p-6">
            <Card className="w-full max-w-2xl p-8 shadow-lg border-slate-100">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-2xl font-semibold text-slate-900">Let's personalize your prep</h1>
                        <span className="text-sm text-slate-500 font-medium">Step {step + 1} of 5</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-4">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${((step + 1) / 5) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="min-h-[420px]">
                    {step === 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-xl font-medium text-slate-900 mb-2">
                                    What's your current level?
                                </h2>
                                <p className="text-sm text-slate-600 mb-6">
                                    Be honest — this helps us calibrate your plan
                                </p>
                            </div>
                            <RadioGroup value={data.level} onValueChange={(val) => updateData("level", val)}>
                                <div className="space-y-3">
                                    {[
                                        {
                                            value: "beginner",
                                            label: "Beginner",
                                            desc: "New to coding interviews or DSA",
                                        },
                                        {
                                            value: "intermediate",
                                            label: "Intermediate",
                                            desc: "Solved 20-50 problems, understand basic patterns",
                                        },
                                        {
                                            value: "advanced",
                                            label: "Advanced",
                                            desc: "Solved 50+ problems, comfortable with most topics",
                                        },
                                    ].map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${data.level === option.value
                                                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                    : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                                                }`}
                                        >
                                            <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-900">{option.label}</div>
                                                <div className="text-sm text-slate-500 leading-relaxed">{option.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-xl font-medium text-slate-900 mb-2">
                                    How confident are you with these topics?
                                </h2>
                                <p className="text-sm text-slate-600 mb-6">
                                    Slide to rate your comfort level (0 = never studied, 100 = very confident)
                                </p>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { key: "arrays" as const, label: "Arrays & Strings" },
                                    { key: "graphs" as const, label: "Graphs & Trees" },
                                    { key: "dp" as const, label: "Dynamic Programming" },
                                    { key: "systemDesign" as const, label: "System Design" },
                                ].map((topic) => (
                                    <div key={topic.key} className="space-y-4">
                                        <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg px-3">
                                            <Label className="text-slate-700 font-semibold">{topic.label}</Label>
                                            <span className="text-sm font-bold text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded">
                                                {data.topicConfidence[topic.key]}%
                                            </span>
                                        </div>
                                        <Slider
                                            value={[data.topicConfidence[topic.key]]}
                                            onValueChange={(val) => updateTopicConfidence(topic.key, val[0])}
                                            max={100}
                                            step={5}
                                            className="w-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-xl font-medium text-slate-900 mb-2">
                                    What's your target role & timeline?
                                </h2>
                                <p className="text-sm text-slate-600 mb-6">
                                    This helps us prioritize topics and set the right pace
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <Label className="text-slate-800 font-semibold mb-4 block">Target Role</Label>
                                    <RadioGroup
                                        value={data.targetRole}
                                        onValueChange={(val) => updateData("targetRole", val)}
                                    >
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {["SWE", "Backend", "Frontend", "Full-stack", "ML Engineer", "Other"].map(
                                                (role) => (
                                                    <label
                                                        key={role}
                                                        className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all duration-200 ${data.targetRole === role
                                                                ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm"
                                                                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                                                            }`}
                                                    >
                                                        <RadioGroupItem value={role} id={role} className="sr-only" />
                                                        <div className="font-semibold">{role}</div>
                                                    </label>
                                                )
                                            )}
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div>
                                    <Label className="text-slate-800 font-semibold mb-4 block">Interview Timeline</Label>
                                    <RadioGroup
                                        value={data.timeline}
                                        onValueChange={(val) => updateData("timeline", val)}
                                    >
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                "2-4 weeks",
                                                "1-2 months",
                                                "3-4 months",
                                                "6+ months",
                                            ].map((time) => (
                                                <label
                                                    key={time}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all duration-200 ${data.timeline === time
                                                            ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm"
                                                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                                                        }`}
                                                >
                                                    <RadioGroupItem value={time} id={time} className="sr-only" />
                                                    <div className="font-semibold">{time}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-xl font-medium text-slate-900 mb-2">
                                    What are your main weaknesses?
                                </h2>
                                <p className="text-sm text-slate-600 mb-6">
                                    Select all that apply — we'll focus your plan on these areas
                                </p>
                            </div>
                            <div className="space-y-3">
                                {[
                                    {
                                        value: "conceptual",
                                        label: "Conceptual understanding",
                                        desc: "Understanding the 'why' behind algorithms",
                                    },
                                    {
                                        value: "patterns",
                                        label: "Pattern recognition",
                                        desc: "Identifying which approach to use",
                                    },
                                    {
                                        value: "speed",
                                        label: "Speed & efficiency",
                                        desc: "Solving problems within time limits",
                                    },
                                    {
                                        value: "communication",
                                        label: "Communication",
                                        desc: "Explaining solutions clearly",
                                    },
                                ].map((weakness) => (
                                    <label
                                        key={weakness.value}
                                        className={`flex items-start space-x-3 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${data.weaknesses.includes(weakness.value)
                                                ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                                            }`}
                                        onClick={() => toggleWeakness(weakness.value)}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-1 transition-colors duration-200 ${data.weaknesses.includes(weakness.value)
                                                    ? "border-blue-600 bg-blue-600"
                                                    : "border-slate-300"
                                                }`}
                                        >
                                            {data.weaknesses.includes(weakness.value) && (
                                                <svg
                                                    className="w-3.5 h-3.5 text-white"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2.5"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900">{weakness.label}</div>
                                            <div className="text-sm text-slate-500 leading-relaxed">{weakness.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-xl font-medium text-slate-900 mb-2">
                                    Final details
                                </h2>
                                <p className="text-sm text-slate-600 mb-6">
                                    This helps us create a realistic, achievable plan
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-center mb-4 bg-slate-50/50 p-2 rounded-lg px-3">
                                        <Label className="text-slate-800 font-semibold">Hours per week available</Label>
                                        <span className="text-sm font-bold text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded">
                                            {data.hoursPerWeek} hours
                                        </span>
                                    </div>
                                    <Slider
                                        value={[data.hoursPerWeek]}
                                        onValueChange={(val) => updateData("hoursPerWeek", val[0])}
                                        max={40}
                                        min={2}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-slate-800 font-semibold mb-2 block">
                                            Constraints (optional)
                                        </Label>
                                        <Textarea
                                            placeholder="e.g., Full-time job, visa timeline, specific company targets..."
                                            value={data.constraints}
                                            onChange={(e) => updateData("constraints", e.target.value)}
                                            className="min-h-[100px] bg-slate-50/30 focus:bg-white transition-colors border-slate-200"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-slate-800 font-semibold mb-2 block">
                                            Past prep experience
                                        </Label>
                                        <Textarea
                                            placeholder="e.g., Solved ~30 LC problems, read CTCI, took a course..."
                                            value={data.pastExperience}
                                            onChange={(e) => updateData("pastExperience", e.target.value)}
                                            className="min-h-[100px] bg-slate-50/30 focus:bg-white transition-colors border-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-10 pt-8 border-t border-slate-100">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={step === 0}
                        className="px-6 py-6 rounded-xl hover:bg-slate-100 border-2 font-semibold"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="px-8 py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md shadow-blue-200 gap-2 transition-all hover:translate-x-1"
                    >
                        {step === 4 ? "Generate My Plan" : "Continue"}
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}
