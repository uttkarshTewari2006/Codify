"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Slider } from "./ui/slider";
import { Textarea } from "./ui/textarea";
import { ChevronRight, ChevronLeft, Search, Network } from "lucide-react";
import { Input } from "./ui/input";

interface OnboardingData {
    level: string;
    targetRole: string;
    otherRole?: string;
    timeline: string;
    hoursPerWeek: number;
    weaknesses: string[];
    struggles: string[];
    networkingOnline: number;
    networkingInPerson: number;
    topicConfidence: {
        arrays: number;
        graphs: number;
        dp: number;
        systemDesign: number;
    };
    constraints: string;
    pastExperience: string;
    additionalInfo: string;
}

interface OnboardingProps {
    onComplete: (data: OnboardingData) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<OnboardingData>({
        level: "",
        targetRole: "",
        otherRole: "",
        timeline: "",
        hoursPerWeek: 10,
        weaknesses: [],
        struggles: [],
        networkingOnline: 50,
        networkingInPerson: 50,
        topicConfidence: {
            arrays: 50,
            graphs: 50,
            dp: 50,
            systemDesign: 50,
        },
        constraints: "",
        pastExperience: "",
        additionalInfo: "",
    });

    const updateData = (field: string, value: any) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleMultiSelect = (field: "weaknesses" | "struggles", value: string) => {
        setData((prev) => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter((v) => v !== value)
                : [...prev[field], value],
        }));
    };

    const updateTopicConfidence = (topic: keyof OnboardingData["topicConfidence"], value: number) => {
        setData((prev) => ({
            ...prev,
            topicConfidence: { ...prev.topicConfidence, [topic]: value },
        }));
    };

    const totalSteps = 6;

    const canProceed = () => {
        switch (step) {
            case 0:
                return data.level !== "";
            case 1:
                return true;
            case 2:
                return data.targetRole !== "" && data.timeline !== "" && (data.targetRole !== "Other" || (data.otherRole?.trim() !== ""));
            case 3:
                return data.struggles.length > 0;
            case 4:
                return true;
            case 5:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (step < totalSteps - 1) {
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
        <div className="flex items-center justify-center p-6 bg-zinc-950 min-h-screen font-sans">
            <Card className="w-full max-w-2xl p-8 shadow-sm border-zinc-800 bg-zinc-900 rounded-lg">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-xl font-semibold text-zinc-50 tracking-tight">Let's personalize your prep</h1>
                        <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Step {step + 1} of {totalSteps}</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded-full mt-4 overflow-hidden">
                        <div
                            className="bg-indigo-500 h-1 transition-all duration-300 ease-out"
                            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="min-h-[420px]">
                    {step === 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-lg font-medium text-zinc-50 mb-1">
                                    What's your current level?
                                </h2>
                                <p className="text-sm text-zinc-400 mb-6">
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
                                            className={`flex items-start space-x-3 p-4 rounded-md border cursor-pointer transition-all duration-200 ${data.level === option.value
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-100 shadow-sm"
                                                : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-800 text-zinc-300"
                                                }`}
                                        >
                                            <RadioGroupItem value={option.value} id={option.value} className="mt-0.5 border-zinc-600 text-indigo-500" />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{option.label}</div>
                                                <div className={`text-xs mt-1 ${data.level === option.value ? "text-indigo-300/80" : "text-zinc-500"}`}>{option.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-lg font-medium text-zinc-50 mb-1">
                                    How confident are you with these topics?
                                </h2>
                                <p className="text-sm text-zinc-400 mb-6">
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
                                        <div className="flex justify-between items-center rounded-md px-1">
                                            <Label className="text-zinc-300 font-medium text-sm">{topic.label}</Label>
                                            <span className="text-xs font-semibold text-zinc-400">
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
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-lg font-medium text-zinc-50 mb-1">
                                    What's your target role & timeline?
                                </h2>
                                <p className="text-sm text-zinc-400 mb-6">
                                    This helps us prioritize topics and set the right pace
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <Label className="text-zinc-200 font-medium mb-3 block text-sm">Target Role</Label>
                                    <RadioGroup
                                        value={data.targetRole}
                                        onValueChange={(val) => updateData("targetRole", val)}
                                    >
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {["SWE", "Backend", "Frontend", "Full-stack", "ML Engineer", "Other"].map(
                                                (role) => (
                                                    <label
                                                        key={role}
                                                        className={`p-3 rounded-md border cursor-pointer text-center text-sm transition-all duration-200 ${data.targetRole === role
                                                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-100 shadow-sm"
                                                            : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-800 text-zinc-300"
                                                            }`}
                                                    >
                                                        <RadioGroupItem value={role} id={role} className="sr-only" />
                                                        <div className="font-medium">{role}</div>
                                                    </label>
                                                )
                                            )}
                                        </div>
                                    </RadioGroup>

                                    {data.targetRole === "Other" && (
                                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label className="text-zinc-400 text-xs mb-1 block">Please specify your role</Label>
                                            <Input
                                                placeholder="e.g. Embedded Engineer..."
                                                value={data.otherRole}
                                                onChange={(e) => updateData("otherRole", e.target.value)}
                                                className="bg-zinc-950 border-zinc-800 rounded-md text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-zinc-200 font-medium mb-3 block text-sm">Interview Timeline</Label>
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
                                                    className={`p-3 rounded-md border cursor-pointer text-center text-sm transition-all duration-200 ${data.timeline === time
                                                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-100 shadow-sm"
                                                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-800 text-zinc-300"
                                                        }`}
                                                >
                                                    <RadioGroupItem value={time} id={time} className="sr-only" />
                                                    <div className="font-medium">{time}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-lg font-medium text-zinc-50 mb-1">
                                    What do you struggle with most?
                                </h2>
                                <p className="text-sm text-zinc-400 mb-6">
                                    Select all that apply — we'll tailor your plan to overcome these hurdles
                                </p>
                            </div>
                            <div className="space-y-3">
                                {[
                                    {
                                        value: "interviews",
                                        label: "Getting interviews",
                                        desc: "Resume, networking, or applications",
                                    },
                                    {
                                        value: "oas",
                                        label: "Passing OAs",
                                        desc: "Online assessments and automated coding tests",
                                    },
                                    {
                                        value: "technical_dsa",
                                        label: "Technical interviews (DSA)",
                                        desc: "Data structures, algorithms, and logic",
                                    },
                                    {
                                        value: "technical_spec",
                                        label: "Technical (Specialization)",
                                        desc: "Data Science, Networking, Embedded, etc.",
                                    },
                                    {
                                        value: "behavioral",
                                        label: "Behavioral interviews",
                                        desc: "Soft skills and culture fit",
                                    },
                                ].map((struggle) => (
                                    <label
                                        key={struggle.value}
                                        className={`flex items-start space-x-3 p-4 rounded-md border cursor-pointer transition-all duration-200 ${data.struggles.includes(struggle.value)
                                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-100 shadow-sm"
                                            : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-800 text-zinc-300"
                                            }`}
                                        onClick={() => toggleMultiSelect("struggles", struggle.value)}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded-sm border flex items-center justify-center mt-0.5 transition-colors duration-200 ${data.struggles.includes(struggle.value)
                                                ? "border-indigo-500 bg-indigo-600"
                                                : "border-zinc-700 bg-zinc-950"
                                                }`}
                                        >
                                            {data.struggles.includes(struggle.value) && (
                                                <svg
                                                    className="w-3 h-3 text-white"
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
                                            <div className="font-medium text-sm">{struggle.label}</div>
                                            <div className={`text-xs mt-1 ${data.struggles.includes(struggle.value) ? "text-indigo-300/80" : "text-zinc-500"}`}>{struggle.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-lg font-medium text-zinc-50 mb-1">
                                    Networking familiarity
                                </h2>
                                <p className="text-sm text-zinc-400 mb-6">
                                    How comfortable are you with networking? (0 = never done it, 100 = pro)
                                </p>
                            </div>
                            <div className="space-y-8 py-4">
                                <div className="space-y-4 shadow-sm border border-zinc-800 bg-zinc-950/50 p-5 rounded-md">
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex items-center gap-2">
                                            <Network className="w-4 h-4 text-zinc-400" />
                                            <Label className="text-zinc-200 font-medium text-sm">Online Networking</Label>
                                        </div>
                                        <span className="text-xs font-semibold text-zinc-400">
                                            {data.networkingOnline}%
                                        </span>
                                    </div>
                                    <Slider
                                        value={[data.networkingOnline]}
                                        onValueChange={(val) => updateData("networkingOnline", val[0])}
                                        max={100}
                                        step={5}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-zinc-500 px-1">LinkedIn, cold emails, online communities, etc.</p>
                                </div>

                                <div className="space-y-4 shadow-sm border border-zinc-800 bg-zinc-950/50 p-5 rounded-md">
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex items-center gap-2">
                                            <Search className="w-4 h-4 text-zinc-400" />
                                            <Label className="text-zinc-200 font-medium text-sm">In-person Networking</Label>
                                        </div>
                                        <span className="text-xs font-semibold text-zinc-400">
                                            {data.networkingInPerson}%
                                        </span>
                                    </div>
                                    <Slider
                                        value={[data.networkingInPerson]}
                                        onValueChange={(val) => updateData("networkingInPerson", val[0])}
                                        max={100}
                                        step={5}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-zinc-500 px-1">Career fairs, meetups, coffee chats, etc.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-lg font-medium text-zinc-50 mb-1">
                                    Final details
                                </h2>
                                <p className="text-sm text-zinc-400 mb-6">
                                    Help us understand your constraints and background
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 rounded-md border border-zinc-800 shadow-sm bg-zinc-950/50">
                                    <div className="flex justify-between items-center mb-4 px-1">
                                        <Label className="text-zinc-200 font-medium text-sm">Hours per week available</Label>
                                        <span className="text-xs font-semibold text-zinc-400">
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

                                <div className="space-y-4 pt-2">
                                    <div>
                                        <Label className="text-zinc-200 font-medium mb-2 block text-sm">
                                            Any other weaknesses? (optional)
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            {[
                                                { value: "conceptual", label: "Conceptual" },
                                                { value: "patterns", label: "Patterns" },
                                                { value: "speed", label: "Speed" },
                                                { value: "communication", label: "Communication" },
                                            ].map((w) => (
                                                <Button
                                                    key={w.value}
                                                    variant="outline"
                                                    size="sm"
                                                    className={`justify-start rounded-md font-normal ${data.weaknesses.includes(w.value) ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-100 border-indigo-500/30' : 'text-zinc-400 border-zinc-800 bg-transparent hover:text-zinc-100 hover:bg-zinc-800'}`}
                                                    onClick={() => toggleMultiSelect("weaknesses", w.value)}
                                                >
                                                    {w.label}
                                                </Button>
                                            ))}
                                        </div>
                                        <Textarea
                                            placeholder="Constraints: e.g. Full-time job, visa timeline..."
                                            value={data.constraints}
                                            onChange={(e) => updateData("constraints", e.target.value)}
                                            className="min-h-[80px] bg-zinc-950 border-zinc-800 rounded-md focus:border-zinc-700 transition-all mb-4 text-sm resize-none text-zinc-100 placeholder:text-zinc-600"
                                        />
                                        <Textarea
                                            placeholder="Past Experience: e.g. Solved ~30 LC problems..."
                                            value={data.pastExperience}
                                            onChange={(e) => updateData("pastExperience", e.target.value)}
                                            className="min-h-[80px] bg-zinc-950 border-zinc-800 rounded-md focus:border-zinc-700 transition-all mb-4 text-sm resize-none text-zinc-100 placeholder:text-zinc-600"
                                        />
                                        <Label className="text-zinc-200 font-medium mb-2 block text-sm">
                                            Anything else you'd like to share?
                                        </Label>
                                        <Textarea
                                            placeholder="Provide any additional context or constraints..."
                                            value={data.additionalInfo}
                                            onChange={(e) => updateData("additionalInfo", e.target.value)}
                                            className="min-h-[100px] bg-zinc-950 border-zinc-800 rounded-md focus:border-zinc-700 transition-all text-sm resize-none text-zinc-100 placeholder:text-zinc-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t border-zinc-800">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={step === 0}
                        className="rounded-md font-medium text-zinc-300 border-zinc-800 bg-transparent hover:bg-zinc-800 hover:text-white h-9 px-4 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm h-9 px-6 transition-colors border-0 disabled:opacity-50"
                    >
                        {step === totalSteps - 1 ? "Generate Plan" : "Continue"}
                        {step !== totalSteps - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
