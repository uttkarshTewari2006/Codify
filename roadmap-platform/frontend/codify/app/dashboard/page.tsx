"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { fetchBackend } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateRoadmapModal } from "@/components/CreateRoadmapModal";
import { DeadlineModal } from "@/components/DeadlineModal";
import { RoadmapCard, Roadmap } from "@/components/RoadmapCard";
import { CuratedRoadmapsDisplay } from "@/components/CuratedRoadmapsDisplay";
import { RecentProgress } from "@/components/RecentProgress";
import {
    Plus,
    Clock,
    Target,
    TrendingUp,
    Settings,
    LogOut,
    Trash2,
    Calendar,
    Pencil
} from "lucide-react";
import { signOut } from "next-auth/react";

interface Deadline {
    id: string;
    title: string;
    targetDate: string;
    status: string;
    type: string;
    roadmapId?: string;
    taskId?: string;
    deliverableId?: number;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
    const [editDeadline, setEditDeadline] = useState<Deadline | null>(null);

    function fetchRoadmaps(showLoading = true) {
        if (showLoading) {
            setLoading(true);
        }
        fetchBackend("/roadmaps")
            .then((res) => res.json())
            .then((data) => {
                setRoadmaps(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching roadmaps:", err);
                setLoading(false);
            });
    }

    function fetchDeadlines() {
        fetchBackend("/deadlines")
            .then((res) => res.json())
            .then((data) => {
                setDeadlines(Array.isArray(data) ? data : []);
            })
            .catch((err) => console.error("Error fetching deadlines:", err));
    }

    useEffect(() => {
        fetchBackend("/roadmaps")
            .then((res) => res.json())
            .then((data) => {
                setRoadmaps(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching roadmaps:", err);
                setLoading(false);
            });

        fetchBackend("/deadlines")
            .then((res) => res.json())
            .then((data) => {
                setDeadlines(Array.isArray(data) ? data : []);
            })
            .catch((err) => console.error("Error fetching deadlines:", err));
    }, []);

    const handleDeleteRoadmap = async (id: string) => {
        if (!confirm("Are you sure you want to delete this roadmap and all its tasks?")) return;

        try {
            const res = await fetchBackend(`/roadmaps/${id}`, { method: "DELETE" });
            if (res.ok) {
                setRoadmaps(prev => prev.filter(r => r.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete roadmap:", err);
        }
    };

    const handleDeleteDeadline = async (id: string) => {
        if (!confirm("Delete this deadline?")) return;
        try {
            const res = await fetchBackend(`/deadlines/${id}`, { method: "DELETE" });
            if (res.ok) {
                setDeadlines(prev => prev.filter(d => d.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete deadline:", err);
        }
    };

    const handleEditDeadline = (d: Deadline) => {
        setEditDeadline(d);
        setIsDeadlineModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
            <Navbar />

            <main className="container mx-auto px-6 py-12 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight mb-2 text-zinc-50">
                            Welcome back, {session?.user?.name || "Explorer"}
                        </h1>
                        <p className="text-base text-zinc-400">
                            Pick up where you left off or explore your AI-generated plans.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-10 px-5 rounded-md border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white font-medium text-zinc-300">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Button>
                        <Button
                            variant="outline"
                            className="h-10 px-5 rounded-md border-zinc-800 bg-zinc-900 text-rose-500 hover:bg-rose-950/30 hover:text-rose-400 hover:border-rose-900/50 font-medium"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Content: Roadmaps */}
                    <div className="md:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-medium mb-5 flex items-center gap-2 text-zinc-100">
                                <Target className="w-5 h-5 text-indigo-500" />
                                Your Roadmaps
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {loading ? (
                                    [1, 2].map((i) => (
                                        <div key={i} className="h-44 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse overflow-hidden" />
                                    ))
                                ) : roadmaps.length > 0 ? (
                                    <>
                                        {/* Create New Card */}
                                        <Card
                                            onClick={() => setIsModalOpen(true)}
                                            className="group p-6 rounded-xl border border-dashed border-zinc-800 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4 min-h-[180px] bg-zinc-900/10 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg relative z-10">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="text-base font-semibold text-zinc-100">New Journey</h3>
                                                <p className="text-sm text-zinc-500">Draft with AI Coach</p>
                                            </div>
                                        </Card>

                                        {roadmaps.map((roadmap) => (
                                            <RoadmapCard key={roadmap.id} roadmap={roadmap} showEdit={true} onDelete={handleDeleteRoadmap} />
                                        ))}
                                    </>
                                ) : (
                                    <div className="col-span-full space-y-10 py-4">
                                        <div className="text-center space-y-4 max-w-lg mx-auto">
                                            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                                                <Target className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-zinc-100 tracking-tight">No learning paths yet</h3>
                                            <p className="text-zinc-400 leading-relaxed">
                                                Ready to level up? Generate a custom AI roadmap or start with one of our curated expert templates.
                                            </p>
                                            <Button
                                                onClick={() => setIsModalOpen(true)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-12 text-base font-semibold shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                Create Your First Path
                                            </Button>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-px flex-1 bg-zinc-800" />
                                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Curated Expert Paths</h3>
                                                <div className="h-px flex-1 bg-zinc-800" />
                                            </div>
                                            <CuratedRoadmapsDisplay />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-medium mb-5 flex items-center gap-2 text-zinc-100">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                Recent Achievements
                            </h2>
                            <RecentProgress />
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <section>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-medium flex items-center gap-2 text-zinc-100">
                                    <Clock className="w-5 h-5 text-amber-500" />
                                    Upcoming Deadlines
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                                    onClick={() => {
                                        setEditDeadline(null);
                                        setIsDeadlineModalOpen(true);
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {deadlines.length > 0 ? (
                                    deadlines.map((d) => (
                                        <Card key={d.id} className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all group overflow-hidden relative">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20 shadow-sm mt-0.5">
                                                    <Clock className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{d.type}</div>
                                                        <div className="text-[10px] font-bold text-amber-500 tabular-nums">
                                                            {new Date(d.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-semibold text-zinc-200 truncate">{d.title}</div>
                                                </div>
                                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditDeadline(d)} className="text-zinc-500 hover:text-indigo-400 transition-colors">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDeleteDeadline(d.id)} className="text-zinc-500 hover:text-rose-400 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="p-10 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center bg-zinc-900/10">
                                        <Calendar className="w-8 h-8 text-zinc-700 mb-4" />
                                        <p className="text-sm text-zinc-500 leading-relaxed max-w-[150px]">No upcoming deadlines scheduled</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <CreateRoadmapModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchRoadmaps}
            />

            <DeadlineModal
                isOpen={isDeadlineModalOpen}
                onClose={() => {
                    setIsDeadlineModalOpen(false);
                    setEditDeadline(null);
                }}
                onSuccess={fetchDeadlines}
                editDeadline={editDeadline}
            />
        </div>
    );
}
