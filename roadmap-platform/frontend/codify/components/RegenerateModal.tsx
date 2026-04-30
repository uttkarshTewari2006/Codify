"use client";

import { useState } from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface RegenerateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (feedback: string) => void;
    loading?: boolean;
}

export function RegenerateModal({ isOpen, onClose, onSubmit, loading }: RegenerateModalProps) {
    const [feedback, setFeedback] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(feedback);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-950 w-full max-w-lg rounded-lg shadow-xl border border-zinc-800 p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                    <X className="w-4 h-4" />
                </button>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-md border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
                                Regenerate AI Plan
                            </h2>
                            <p className="text-sm text-zinc-400 mt-0.5">Tell the AI Coach what you&apos;d like to adjust.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 block leading-tight">
                            What specifically don&apos;t you like about the plan, and what should the next plan be?
                        </label>
                        <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="e.g. Focus more on frontend engineering, compress the timeline, replace LeetCode with projects..."
                            className="rounded-md border-zinc-800 min-h-[140px] bg-zinc-900/50 text-zinc-100 text-sm resize-none placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-zinc-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 rounded-md text-zinc-300 font-medium hover:bg-zinc-800 hover:text-white border-zinc-800 bg-transparent h-10"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !feedback.trim()}
                            className="flex-1 rounded-md bg-indigo-600 hover:bg-indigo-700 font-medium text-white shadow-sm h-10 border-0 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" /> Regenerating...
                                </>
                            ) : (
                                "Regenerate Plan"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
