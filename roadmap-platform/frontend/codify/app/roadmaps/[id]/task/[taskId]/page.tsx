"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchBackend } from "@/lib/api";
import {
    ArrowLeft,
    Code2,
    Rocket,
    Info,
    Target,
    Settings,
    Clock,
    CheckCircle2,
    Circle,
    Link as LinkIcon,
    ListTodo
} from "lucide-react";

interface Deliverable {
    title: string;
    completed: boolean;
    completedAt?: string | null;
}

interface Task {
    id: string;
    title: string;
    description: string;
    duration: string;
    type: "problem" | "guide" | "info" | "goal";
    status: string;
    order: number;
    deliverables: Deliverable[] | null;
    links: string[] | null;
}

const TYPE_COLORS = {
    problem: "bg-rose-950/30 text-rose-400 border-rose-900/50",
    guide: "bg-indigo-950/50 text-indigo-400 border-indigo-500/20",
    info: "bg-zinc-900/50 text-zinc-400 border-zinc-800",
    goal: "bg-emerald-950/30 text-emerald-400 border-emerald-500/20",
};

const TYPE_ICONS = {
    problem: Code2,
    guide: Rocket,
    info: Info,
    goal: Target,
};

export default function TaskViewPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
    const { id, taskId } = use(params);
    const router = useRouter();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTask = async () => {
            try {
                const res = await fetchBackend(`/roadmaps/${id}/tasks/${taskId}`);
                if (res.ok) {
                    const data = await res.json();
                    setTask(data);
                }
            } catch (err) {
                console.error("Error loading task:", err);
            } finally {
                setLoading(false);
            }
        };
        loadTask();
    }, [id, taskId]);

    const toggleStatus = async () => {
        if (!task) return;
        const newStatus = task.status === "completed" ? "todo" : "completed";
        // Optimistic update
        setTask({ ...task, status: newStatus });
        try {
            await fetchBackend(`/roadmaps/${id}/edit-task/${taskId}`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (err) {
            console.error("Error updating status:", err);
            // Revert
            setTask({ ...task, status: task.status });
        }
    };

    const toggleDeliverable = async (index: number) => {
        if (!task || !task.deliverables) return;
        const newDeliverables = [...task.deliverables];
        const d = newDeliverables[index];
        newDeliverables[index] = { ...d, completed: !d.completed };
        
        // Optimistic update
        setTask({ ...task, deliverables: newDeliverables });
        
        try {
            await fetchBackend(`/roadmaps/${id}/edit-task/${taskId}`, {
                method: "PATCH",
                body: JSON.stringify({ deliverables: newDeliverables }),
            });
        } catch (err) {
            console.error("Error updating deliverable:", err);
            // Revert
            setTask({ ...task, deliverables: task.deliverables });
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-zinc-950 py-24 text-center font-sans text-zinc-50">Loading Task...</div>;
    }

    if (!task) {
        return <div className="min-h-screen bg-zinc-950 py-24 text-center font-sans text-zinc-50">Task not found.</div>;
    }

    const isCompleted = task.status === "completed";
    const Icon = TYPE_ICONS[task.type] || Info;
    const colorClass = TYPE_COLORS[task.type] || TYPE_COLORS.info;

    // Data is now already parsed or null from the schema update
    const deliverables = task.deliverables || [];
    const links = task.links || [];

    return (
        <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-10">
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/roadmaps/${id}`)}
                        className="rounded-md h-10 px-4 gap-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Roadmap
                    </Button>
                    <Button
                        onClick={() => router.push(`/roadmaps/${id}/task/${taskId}/edit`)}
                        className="rounded-md h-10 px-6 bg-zinc-800 hover:bg-zinc-700 text-white font-medium shadow-sm gap-2 transition-colors border-0"
                    >
                        <Settings className="w-4 h-4" />
                        Edit Task
                    </Button>
                </div>

                <div className="space-y-8">
                    {/* Header Card */}
                    <Card isDark={true} className="p-8 bg-zinc-900/40 border-zinc-800 relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${colorClass} shrink-0`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded border ${colorClass}`}>
                                            {task.type}
                                        </span>
                                        {task.duration && (
                                            <span className="flex items-center gap-1.5 text-sm text-zinc-400 font-medium">
                                                <Clock className="w-4 h-4" />
                                                {task.duration}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={toggleStatus}
                                variant={isCompleted ? "default" : "outline"}
                                className={`rounded-full h-10 px-5 gap-2 font-medium transition-all ${isCompleted
                                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0"
                                        : "border-zinc-700 bg-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                    }`}
                            >
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                {isCompleted ? "Completed" : "Mark as Complete"}
                            </Button>
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 mb-4">{task.title}</h1>
                        <p className="text-lg text-zinc-400 leading-relaxed whitespace-pre-wrap">{task.description || "No description provided."}</p>
                    </Card>

                    {/* Deliverables */}
                    {deliverables.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
                                <ListTodo className="w-5 h-5 text-indigo-500" />
                                Deliverables & Milestones
                            </h2>
                            <Card isDark={true} className="p-6 bg-zinc-900/30 border-zinc-800 backdrop-blur-sm">
                                <div className="space-y-3">
                                    {deliverables.map((d, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => toggleDeliverable(idx)}
                                            className={`flex items-center gap-4 p-3 rounded-lg border border-transparent transition-all cursor-pointer group ${
                                                d.completed 
                                                    ? "bg-emerald-500/5 text-emerald-400/80 border-emerald-500/10" 
                                                    : "hover:bg-zinc-800/50 hover:border-zinc-700 text-zinc-300"
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                                                d.completed 
                                                    ? "bg-emerald-500 border-emerald-500 text-zinc-950" 
                                                    : "bg-zinc-800 border-zinc-700 group-hover:border-zinc-500"
                                            }`}>
                                                {d.completed && <CheckCircle2 className="w-4 h-4" strokeWidth={3} />}
                                            </div>
                                            <span className={`text-base flex-1 ${d.completed ? "line-through opacity-50" : ""}`}>
                                                {d.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Links */}
                    {links.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
                                <LinkIcon className="w-5 h-5 text-indigo-500" />
                                Resources & Links
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {links.map((link, idx) => {
                                    // Try to make it a valid URL
                                    const href = link.startsWith('http') ? link : `https://${link}`;
                                    return (
                                        <a href={href} target="_blank" rel="noopener noreferrer" key={idx}>
                                            <Card isDark={true} className="p-4 bg-zinc-900/30 border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-900/80 backdrop-blur-sm transition-all flex items-center gap-3 group">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                                                    <LinkIcon className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 truncate flex-1">
                                                    {link}
                                                </span>
                                            </Card>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
