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
    Plus,
    ExternalLink
} from "lucide-react";
import Link from "next/link";

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

interface Roadmap {
    id: string;
    title: string;
    description: string;
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

function TaskStaticItem({ task, roadmapId }: { task: Task, roadmapId: string }) {
    const Icon = TYPE_ICONS[task.type] || Info;
    const colorClass = TYPE_COLORS[task.type] || TYPE_COLORS.info;

    return (
        <div className="group mb-4">
            <Card isDark={true} className="p-5 bg-zinc-900/50 border-zinc-800 shadow-sm flex items-center gap-5 relative overflow-hidden rounded-md">
                <div className={`w-12 h-12 rounded-md flex items-center justify-center border ${colorClass} shrink-0`}>
                    <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 py-1.5">
                    <div className="flex items-center gap-3 mb-1">
                        <Link href={`/roadmaps/${roadmapId}/task/${task.id}`}>
                            <h4 className="font-semibold text-base text-zinc-100 truncate hover:text-indigo-400 transition-colors flex items-center gap-2 group-title cursor-pointer">
                                {task.title}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h4>
                        </Link>
                        <span className={`text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${colorClass}`}>
                            {task.type}
                        </span>
                    </div>
                    <p className="text-sm text-zinc-500 truncate">{task.description}</p>
                    {task.duration && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-400 font-medium">
                            <Clock className="w-3 h-3" />
                            {task.duration}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

export default function RoadmapViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetchBackend(`/roadmaps/${id}`);
                const data = await res.json();
                setRoadmap(data.roadmap);
                setTasks(data.tasks || []);
            } catch (err) {
                console.error("Error loading roadmap:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-zinc-950 py-24 text-center font-sans text-zinc-50">Loading Roadmap...</div>;
    }

    if (!roadmap) {
        return <div className="min-h-screen bg-zinc-950 py-24 text-center font-sans text-zinc-50">Roadmap not found.</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-10">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/dashboard")}
                        className="rounded-md h-10 px-4 gap-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Dashboard
                    </Button>
                    <Button
                        onClick={() => router.push(`/roadmaps/${id}/edit`)}
                        className="rounded-md h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm gap-2 transition-colors border-0"
                    >
                        <Settings className="w-5 h-5 shadow-sm" /> 
                        Edit Roadmap
                    </Button>
                </div>

                <div className="space-y-12">
                    {/* Header */}
                    <div className="space-y-3">
                        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 px-3 -mx-3">
                            {roadmap.title}
                        </h1>
                        <p className="text-lg text-zinc-400 px-3 -mx-3 min-h-[48px]">
                            {roadmap.description || "No description provided."}
                        </p>

                        {/* Progress Bar */}
                        {tasks.length > 0 && (
                            <div className="pt-4 px-3 -mx-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Overall Progress</span>
                                    <span className="text-sm font-bold text-indigo-400">
                                        {Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100)}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
                                    <div 
                                        className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(79,70,229,0.4)]"
                                        style={{ width: `${(tasks.filter(t => t.status === "completed").length / tasks.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Task List Section */}
                    <section>
                        <div className="flex items-center justify-between mb-8 pb-3 border-b border-zinc-800">
                            <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-3">
                                <Plus className="w-5 h-5 text-indigo-500" />
                                Learning Path
                            </h2>
                        </div>

                        <div>
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <TaskStaticItem
                                        key={task.id}
                                        task={task}
                                        roadmapId={id}
                                    />
                                ))
                            ) : (
                                <Card isDark={true} className="p-12 text-center border-dashed border border-zinc-700 bg-zinc-900/20 rounded-lg shadow-none">
                                    <p className="text-zinc-500 text-sm">No tasks yet. Switch to Edit mode to build your path.</p>
                                </Card>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
