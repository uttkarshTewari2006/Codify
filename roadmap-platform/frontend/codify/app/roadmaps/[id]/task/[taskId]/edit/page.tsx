"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fetchBackend } from "@/lib/api";
import { ArrowLeft, Plus, Save, Trash2, Settings } from "lucide-react";

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
    type: string;
    status: string;
    order: number;
    deliverables: Deliverable[] | null;
    links: string[] | null;
}

export default function TaskEditPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
    const { id, taskId } = use(params);
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [type, setType] = useState("info");
    const [deliverables, setDeliverables] = useState<string[]>([]);
    const [links, setLinks] = useState<string[]>([]);

    useEffect(() => {
        const loadTask = async () => {
            try {
                const res = await fetchBackend(`/roadmaps/${id}/tasks/${taskId}`);
                if (res.ok) {
                    const data: Task = await res.json();
                    setTitle(data.title || "");
                    setDescription(data.description || "");
                    setDuration(data.duration || "");
                    setType(data.type || "info");
                    
                    if (data.deliverables) {
                        const items = Array.isArray(data.deliverables) 
                            ? data.deliverables.map((d: any) => typeof d === 'string' ? d : d.title) 
                            : [];
                        setDeliverables(items);
                    }

                    if (data.links) {
                        const items = Array.isArray(data.links) ? data.links : [];
                        setLinks(items);
                    }
                }
            } catch (err) {
                console.error("Error loading task:", err);
            } finally {
                setLoading(false);
            }
        };
        loadTask();
    }, [id, taskId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const cleanDeliverables = deliverables.map(d => d.trim()).filter(d => d.length > 0);
            const cleanLinks = links.map(l => l.trim()).filter(l => l.length > 0);

            await fetchBackend(`/roadmaps/${id}/edit-task/${taskId}`, {
                method: "PATCH",
                body: JSON.stringify({
                    title,
                    description,
                    duration,
                    type,
                    deliverables: JSON.stringify(cleanDeliverables),
                    links: JSON.stringify(cleanLinks)
                }),
            });
            router.push(`/roadmaps/${id}/task/${taskId}`);
        } catch (err) {
            console.error("Error saving task:", err);
        } finally {
            setSaving(false);
        }
    };

    const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
        setter(prev => prev.map((item, i) => i === index ? value : item));
    };

    const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

    const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => [...prev, ""]);
    };

    if (loading) return <div className="min-h-screen bg-zinc-950 py-24 text-center text-zinc-50 font-sans">Loading Task...</div>;

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
                    
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/roadmaps/${id}/task/${taskId}`)}
                            className="rounded-md h-10 px-5 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white font-medium text-zinc-300"
                        >
                            Switch to View
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-md h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm gap-2 transition-colors border-0"
                        >
                            {saving ? "Saving..." : <><Save className="w-5 h-5 shadow-sm" /> Save Changes</>}
                        </Button>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card isDark={true} className="p-8 bg-zinc-900/40 border-zinc-800">
                        <h2 className="text-xl font-semibold tracking-tight text-zinc-100 mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-indigo-500" />
                            Task Details
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Title</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="rounded-md border-zinc-800 bg-zinc-900/50 text-zinc-100 h-11"
                                    placeholder="Enter task title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-zinc-300">Description</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="rounded-md border-zinc-800 bg-zinc-900/50 text-zinc-100 min-h-[120px] resize-none"
                                    placeholder="Enter task description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-zinc-300">Duration</Label>
                                    <Input
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="rounded-md border-zinc-800 bg-zinc-900/50 text-zinc-100 h-11"
                                        placeholder="e.g. 2 hours"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-zinc-300">Type</Label>
                                    <div className="relative">
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full h-11 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer appearance-none"
                                        >
                                            <option value="info">Info</option>
                                            <option value="problem">Problem</option>
                                            <option value="guide">Guide</option>
                                            <option value="goal">Goal</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Deliverables Edit */}
                    <Card isDark={true} className="p-8 bg-zinc-900/40 border-zinc-800">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Deliverables</h2>
                                <p className="text-sm text-zinc-500 mt-1">Checklist items to complete this task.</p>
                            </div>
                            <Button onClick={() => addArrayItem(setDeliverables)} variant="outline" size="sm" className="h-9 px-3 border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 gap-2">
                                <Plus className="w-4 h-4" /> Add Item
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                            {deliverables.length === 0 && <p className="text-sm text-zinc-500 italic">No deliverables added yet.</p>}
                            {deliverables.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <Input
                                        value={item}
                                        onChange={(e) => updateArrayItem(setDeliverables, idx, e.target.value)}
                                        className="rounded-md border-zinc-800 bg-zinc-900/50 text-zinc-100 flex-1"
                                        placeholder={`Deliverable ${idx + 1}`}
                                    />
                                    <Button
                                        onClick={() => removeArrayItem(setDeliverables, idx)}
                                        variant="ghost"
                                        className="h-10 w-10 p-0 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Links Edit */}
                    <Card isDark={true} className="p-8 bg-zinc-900/40 border-zinc-800">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Resources & Links</h2>
                                <p className="text-sm text-zinc-500 mt-1">External URLs, references, or reading material.</p>
                            </div>
                            <Button onClick={() => addArrayItem(setLinks)} variant="outline" size="sm" className="h-9 px-3 border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 gap-2">
                                <Plus className="w-4 h-4" /> Add Link
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                            {links.length === 0 && <p className="text-sm text-zinc-500 italic">No links added yet.</p>}
                            {links.map((link, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <Input
                                        value={link}
                                        onChange={(e) => updateArrayItem(setLinks, idx, e.target.value)}
                                        className="rounded-md border-zinc-800 bg-zinc-900/50 text-zinc-100 flex-1 font-mono text-sm"
                                        placeholder="https://..."
                                    />
                                    <Button
                                        onClick={() => removeArrayItem(setLinks, idx)}
                                        variant="ghost"
                                        className="h-10 w-10 p-0 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}
