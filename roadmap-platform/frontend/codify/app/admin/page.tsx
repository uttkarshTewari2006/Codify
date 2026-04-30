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
    ShieldCheck,
    Search,
    AlertCircle
} from "lucide-react";

interface RAGStats {
    available?: boolean;
    total_chunks: number;
    collection_name: string;
    persist_directory: string;
    error?: string;
}

interface RetrievalResult {
    content: string;
    metadata?: {
        source?: string;
        chunk?: number;
        type?: string;
    };
}

export default function AdminDashboard() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<RAGStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [ingesting, setIngesting] = useState(false);
    const [querying, setQuerying] = useState(false);
    const [testQuery, setTestQuery] = useState("");
    const [testResults, setTestResults] = useState<RetrievalResult[]>([]);
    const [queryError, setQueryError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    useEffect(() => {
        if (sessionStatus === "loading") return;

        // Redirect if not logged in or not an admin
        if (!session || !session.user?.isAdmin) {
            router.push("/dashboard");
        } else {
            fetchStats();
        }
    }, [session, sessionStatus, router]);

    const fetchStats = async () => {
        try {
            const res = await fetchBackend("/admin/rag/stats");
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.detail || "Failed to fetch RAG stats.");
            }
            setStats(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
            setActionMessage(err instanceof Error ? err.message : "Failed to fetch RAG stats.");
            setLoading(false);
        }
    };

    const handleIngest = async () => {
        setIngesting(true);
        setActionMessage(null);
        try {
            const res = await fetchBackend("/admin/rag/ingest", { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.detail || "Ingestion failed.");
            }
            await fetchStats();
            setActionMessage(data?.message || "Knowledge base ingestion successful.");
        } catch (err) {
            setActionMessage(err instanceof Error ? err.message : "Ingestion failed.");
        } finally {
            setIngesting(false);
        }
    };

    const handleTestQuery = async () => {
        const query = testQuery.trim();
        if (!query) {
            setQueryError("Enter a query to test retrieval.");
            setTestResults([]);
            return;
        }

        setQuerying(true);
        setQueryError(null);
        setActionMessage(null);

        try {
            const res = await fetchBackend("/admin/rag/query", {
                method: "POST",
                body: JSON.stringify({ query, top_k: 5 }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.detail || "Retrieval test failed.");
            }
            setTestResults(data?.results || []);
        } catch (err) {
            setTestResults([]);
            setQueryError(err instanceof Error ? err.message : "Retrieval test failed.");
        } finally {
            setQuerying(false);
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

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Management Section */}
                    <section className="space-y-6">
                        <Card className="p-6 bg-zinc-900/40 border-zinc-800">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <Database className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-zinc-200">Knowledge Base</h2>
                                    <p className="text-sm text-zinc-400">
                                        {loading ? "Loading RAG stats..." : stats?.collection_name || "roadmap_knowledge"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-3xl font-bold">{stats?.total_chunks ?? 0}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Chunks Indexed</div>
                                {stats?.persist_directory && (
                                    <p className="text-xs text-zinc-500 break-all">
                                        {stats.persist_directory}
                                    </p>
                                )}
                                {stats?.error && (
                                    <p className="text-sm text-amber-300 leading-relaxed">
                                        {stats.error}
                                    </p>
                                )}
                                {actionMessage && (
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        {actionMessage}
                                    </p>
                                )}
                            </div>
                        </Card>

                        <h2 className="text-xl font-medium flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-indigo-500" />
                            Knowledge Ingestion
                        </h2>
                        <Card className="p-6 bg-zinc-900/20 border-zinc-800 border-dashed">
                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                Rebuild the vector index from markdown knowledge documents in <code className="text-zinc-300">backend/seed_data/knowledge</code> using the configured OpenAI embedding model.
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
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            void handleTestQuery();
                                        }
                                    }}
                                />
                                <Button
                                    variant="secondary"
                                    className="h-10 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                                    onClick={() => void handleTestQuery()}
                                    disabled={querying}
                                >
                                    {querying ? (
                                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Testing...</>
                                    ) : "Test"}
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Retrieved Context Chunks</div>
                                {queryError ? (
                                    <div className="p-4 border border-rose-900 rounded-md bg-rose-950/20 text-sm text-rose-300">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                            <span>{queryError}</span>
                                        </div>
                                    </div>
                                ) : testResults.length > 0 ? (
                                    <div className="space-y-3">
                                        {testResults.map((result, index) => (
                                            <div key={`${result.metadata?.source || "chunk"}-${index}`} className="p-4 border border-zinc-800 rounded-md bg-zinc-950/50">
                                                <div className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-widest text-zinc-500">
                                                    <span>{result.metadata?.source || "Unknown source"}</span>
                                                    {typeof result.metadata?.chunk === "number" && (
                                                        <span>Chunk {result.metadata.chunk}</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                                    {result.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 border border-zinc-800 rounded-md bg-zinc-950/50 text-xs text-zinc-400 italic">
                                        No chunks retrieved yet. Use the test bar above.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </section>
                </div>
            </main>
        </div>
    );
}
