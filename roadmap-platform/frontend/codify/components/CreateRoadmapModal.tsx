"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Code2, Wand2, X, Plus, Rocket } from "lucide-react";
import { fetchBackend } from "@/lib/api";

interface CreateRoadmapModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (roadmapId: string) => void;
}

export function CreateRoadmapModal({ isOpen, onClose, onSuccess }: CreateRoadmapModalProps) {
    const router = useRouter();
    const [mode, setMode] = useState<"choice" | "manual">("choice");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleManualCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetchBackend("/roadmaps", {
                method: "POST",
                body: JSON.stringify({ title, description }),
            });
            if (res.ok) {
                const data = await res.json();
                onSuccess(data.id);
                router.push(`/roadmaps/${data.id}/edit`);
                onClose();
            }
        } catch (err) {
            console.error("Error creating roadmap:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAICreate = () => {
        router.push("/generate");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 w-full max-w-xl rounded-lg shadow-2xl border border-zinc-800 overflow-hidden relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6 font-sans text-zinc-50">
                    {mode === "choice" ? (
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold tracking-tight">Create New Roadmap</h2>
                                <p className="text-sm text-zinc-400 mt-1">Choose how you'd like to build your path.</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setMode("manual")}
                                    className="group p-5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 transition-all text-left flex flex-col items-start shadow-sm"
                                >
                                    <div className="w-10 h-10 bg-zinc-800 rounded-md border border-zinc-700 flex items-center justify-center text-zinc-400 mb-3 group-hover:text-zinc-200 transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-medium text-zinc-100">Manual Build</h3>
                                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Create tasks one by one and organize them your way.</p>
                                </button>

                                <button
                                    onClick={handleAICreate}
                                    className="group p-5 rounded-md border border-zinc-800 hover:border-indigo-500/50 bg-zinc-900/50 hover:bg-indigo-500/5 transition-all text-left flex flex-col items-start shadow-sm"
                                >
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-md border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                                        <Wand2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-medium text-indigo-300">AI Coach</h3>
                                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Generate a personalized plan using our AI assistant.</p>
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleManualCreate} className="space-y-5">
                            <div className="mb-2">
                                <h2 className="text-xl font-semibold tracking-tight text-zinc-50">Manual Creation</h2>
                                <p className="text-sm text-zinc-400 mt-1">Configure your new custom roadmap.</p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="title" className="text-sm font-medium text-zinc-300">Roadmap Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Frontend Engineering Mastery"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="rounded-md border-zinc-800 bg-zinc-950 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-sm font-medium text-zinc-300">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Brief overview of this roadmap..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="rounded-md border-zinc-800 bg-zinc-950 min-h-[100px] text-sm resize-none text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setMode("choice")}
                                    className="flex-1 rounded-md border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                                >
                                    {loading ? "Creating..." : "Create Roadmap"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
