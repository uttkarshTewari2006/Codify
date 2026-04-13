"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchBackend } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Database, 
    RefreshCw, 
    MessageSquare, 
    Activity, 
    ShieldCheck,
    Search,
    AlertCircle
} from "lucide-react";

interface RAGStats {
    total_chunks: number;
    collection_name: string;
    persist_directory: string;
}

export default function AdminDashboard() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<RAGStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [ingesting, setIngesting] = useState(false);
    const [testQuery, setTestQuery] = useState("");
    const [testResults, setTestResults] = useState<any[]>([]);

    useEffect(() => {
        if (sessionStatus === "loading") return;

        // Redirect if not logged in or not an admin
        if (!session || !(session.user as any).isAdmin) {
            router.push("/dashboard");
        } else {
            fetchStats();
        }
    }, [session, sessionStatus, router]);

    const fetchStats = async () => {
        try {
            const res = await fetchBackend("/admin/rag/stats");
            const data = await res.json();
            setStats(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
            setLoading(false);
        }
    };

    const handleIngest = async () => {
        setIngesting(true);
        try {
            await fetchBackend("/admin/rag/ingest", { method: "POST" });
            await fetchStats();
            alert("Knowledge base ingestion successful!");
        } catch (err) {
            alert("Ingestion failed.");
        } finally {
            setIngesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
            <Navbar />

            <main className="container mx-auto px-6 py-12 max-w-6xl">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight mb-2 flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-indigo-500" />
                            Admin Command Center
                        </h1>
                        <p className="text-zinc-400">Manage RAG pipeline, knowledge ingestion, and LLM performance.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6 bg-zinc-900/40 border-zinc-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Database className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h3 className="font-semibold text-zinc-200">Knowledge Base</h3>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold">{stats?.total_chunks || 0}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Chunks Indexed</div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-zinc-900/40 border-zinc-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Activity className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h3 className="font-semibold text-zinc-200">System Health</h3>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold text-emerald-400">Healthy</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">ChromaDB Status</div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-zinc-900/40 border-zinc-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="font-semibold text-zinc-200">Feedback Signal</h3>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold">12</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">Recent Dislikes</div>
                        </div>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Management Section */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-medium flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-indigo-500" />
                            Knowledge Ingestion
                        </h2>
                        <Card className="p-6 bg-zinc-900/20 border-zinc-800 border-dashed">
                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                Synchronize the vector database with the latest curated roadmaps and knowledge documents from roadmap.sh derived sources.
                            </p>
                            <Button 
                                onClick={handleIngest} 
                                disabled={ingesting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
                            >
                                {ingesting ? (
                                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Ingesting...</>
                                ) : "Trigger Re-index"}
                            </Button>
                        </Card>

                        <h2 className="text-xl font-medium flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                            User Dislikes Feed
                        </h2>
                        <div className="space-y-3">
                            {[
                                "Too much focus on Java, I wanted Python.",
                                "Missing links for the first 3 modules.",
                                "Duration estimates are way too optimistic."
                            ].map((msg, i) => (
                                <Card key={i} className="p-4 bg-zinc-900/40 border-zinc-800">
                                    <div className="flex gap-4">
                                        <div className="text-xs font-bold text-rose-500 px-2 py-1 bg-rose-500/10 rounded h-fit">REGEN</div>
                                        <p className="text-sm text-zinc-300">"{msg}"</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Test Retrieval Section */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-medium flex items-center gap-2">
                            <Search className="w-5 h-5 text-indigo-500" />
                            Retrieval Playground
                        </h2>
                        <Card className="p-6 bg-zinc-900/40 border-zinc-800">
                            <div className="flex gap-2 mb-6">
                                <input 
                                    type="text" 
                                    placeholder="Simulate user query (e.g. Backend Dev)..." 
                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-4 text-sm focus:outline-none focus:border-indigo-500"
                                    value={testQuery}
                                    onChange={(e) => setTestQuery(e.target.value)}
                                />
                                <Button variant="secondary" className="h-10 bg-zinc-800 text-zinc-200 hover:bg-zinc-700">Test</Button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Retrieved Context Chunks</div>
                                <div className="p-4 border border-zinc-800 rounded-md bg-zinc-950/50 text-xs text-zinc-400 italic">
                                    No chunks retrieved yet. Use the test bar above.
                                </div>
                            </div>
                        </Card>
                    </section>
                </div>
            </main>
        </div>
    );
}
