"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { RegenerateModal } from "@/components/RegenerateModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fetchBackend } from "@/lib/api";
import {
    Plus,
    ArrowLeft,
    Save,
    Trash2,
    GripVertical,
    Code2,
    Rocket,
    Info,
    Target,
    Clock,
    X,
    Settings,
    ExternalLink,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

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

function SortableTaskItem({
    task,
    onDelete,
    onEdit,
    roadmapId
}: {
    task: Task;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
    roadmapId: string;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : "auto",
        opacity: isDragging ? 0.5 : 1,
    };

    const Icon = TYPE_ICONS[task.type] || Info;
    const colorClass = TYPE_COLORS[task.type] || TYPE_COLORS.info;

    return (
        <div ref={setNodeRef} style={style} className="group mb-4">
            <Card isDark={true} className="p-5 bg-zinc-900/50 border-zinc-800 shadow-sm hover:border-indigo-500/30 hover:bg-zinc-900 transition-colors flex items-center gap-5 relative overflow-hidden rounded-md">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <GripVertical className="w-6 h-6" />
                </div>

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

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-md h-8 w-8 p-0 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                        onClick={() => onEdit(task)}
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-md h-8 w-8 p-0 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                        onClick={() => onDelete(task.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export default function RoadmapEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskFormData, setTaskFormData] = useState<Partial<Task>>({
        title: "",
        description: "",
        duration: "",
        type: "info",
    });

    const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = tasks.findIndex((t) => t.id === active.id);
            const newIndex = tasks.findIndex((t) => t.id === over.id);
            const newTasks = arrayMove(tasks, oldIndex, newIndex);
            
            // Previous state for rollback
            const previousTasks = [...tasks];
            
            // Optimistic update
            setTasks(newTasks);

            try {
                const res = await fetchBackend(`/roadmaps/${id}/reorder-tasks`, {
                    method: "PATCH",
                    body: JSON.stringify({ task_ids: newTasks.map(t => t.id) }),
                });
                
                if (!res.ok) {
                    throw new Error("Failed to sync reorder");
                }
            } catch (err) {
                console.error("Error updating order:", err);
                // Rollback on error
                setTasks(previousTasks);
            }
        }
    };

    const handleSaveRoadmap = async () => {
        if (!roadmap) return;
        setSaving(true);
        try {
            await fetchBackend(`/roadmaps/${id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    title: roadmap.title,
                    description: roadmap.description
                }),
            });
        } catch (err) {
            console.error("Error saving roadmap:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerate = async (feedback: string) => {
        if (!roadmap) return;
        setRegenerating(true);
        try {
            const dashboard = {
                title: roadmap.title,
                description: roadmap.description,
                tasks: tasks
            };
            
            const res = await fetchBackend(`/roadmaps/${id}/regenerate`, {
                method: "POST",
                body: JSON.stringify({ dashboard, feedback }),
            });
            
            if (res.ok) {
                setIsRegenerateModalOpen(false);
                const reloadRes = await fetchBackend(`/roadmaps/${id}`);
                const reloadData = await reloadRes.json();
                setRoadmap(reloadData.roadmap);
                setTasks(reloadData.tasks || []);
            } else {
                console.error("Failed to regenerate");
            }
        } catch (err) {
            console.error("Error regenerating roadmap:", err);
        } finally {
            setRegenerating(false);
        }
    };

    const handleTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTask) {
                // Update
                const res = await fetchBackend(`/roadmaps/${id}/edit-task/${editingTask.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(taskFormData),
                });
                if (res.ok) {
                    const updated = await res.json();
                    setTasks(tasks.map(t => t.id === updated.id ? updated : t));
                }
            } else {
                // Create
                const res = await fetchBackend(`/roadmaps/${id}/tasks`, {
                    method: "POST",
                    body: JSON.stringify(taskFormData),
                });
                if (res.ok) {
                    const newTask = await res.json();
                    setTasks([...tasks, newTask]);
                }
            }
            setIsTaskModalOpen(false);
            setEditingTask(null);
            setTaskFormData({ title: "", description: "", duration: "", type: "info" });
        } catch (err) {
            console.error("Error saving task:", err);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const res = await fetchBackend(`/roadmaps/${id}/delete-task/${taskId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setTasks(tasks.filter(t => t.id !== taskId));
            }
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-zinc-950 py-24 text-center font-sans text-zinc-50">Loading Editor...</div>;
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
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsRegenerateModalOpen(true)}
                            className="rounded-md h-10 px-4 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white font-medium text-zinc-300"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/roadmaps/${id}`)}
                            className="rounded-md h-10 px-5 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white font-medium text-zinc-300"
                        >
                            Switch to View
                        </Button>
                        <Button
                            onClick={handleSaveRoadmap}
                            disabled={saving}
                            className="rounded-md h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm gap-2 transition-colors border-0"
                        >
                            {saving ? "Saving..." : <><Save className="w-5 h-5 shadow-sm" /> Save Changes</>}
                        </Button>
                    </div>
                </div>

                <div className="space-y-12">
                    {/* Header Editor */}
                    <div className="space-y-3">
                        <Input
                            value={roadmap.title}
                            onChange={(e) => setRoadmap({ ...roadmap, title: e.target.value })}
                            className="text-4xl font-semibold tracking-tight text-zinc-50 border-none bg-transparent hover:bg-zinc-900/50 focus:bg-zinc-900/80 p-0 h-auto focus:ring-0 rounded-md px-3 -mx-3 transition-colors outline-none shadow-none placeholder:text-zinc-600"
                            placeholder="Roadmap Title"
                        />
                        <Textarea
                            value={roadmap.description}
                            onChange={(e) => setRoadmap({ ...roadmap, description: e.target.value })}
                            className="text-lg text-zinc-400 border-none bg-transparent hover:bg-zinc-900/50 focus:bg-zinc-900/80 p-0 min-h-[48px] resize-none focus:ring-0 rounded-md px-3 -mx-3 transition-colors outline-none shadow-none placeholder:text-zinc-600"
                            placeholder="Add a description..."
                        />
                    </div>

                    {/* Task List Section */}
                    <section>
                        <div className="flex items-center justify-between mb-8 pb-3 border-b border-zinc-800">
                            <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-3">
                                <Plus className="w-5 h-5 text-indigo-500" />
                                Learning Path
                            </h2>
                            <Button
                                onClick={() => {
                                    setEditingTask(null);
                                    setTaskFormData({ title: "", description: "", duration: "", type: "info" });
                                    setIsTaskModalOpen(true);
                                }}
                                variant="outline"
                                className="rounded-md h-10 px-4 text-sm font-medium border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white gap-2 text-zinc-300"
                            >
                                <Plus className="w-4 h-4" />
                                Add Task
                            </Button>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis]}
                        >
                            <SortableContext
                                items={tasks.map(t => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {tasks.length > 0 ? (
                                    tasks.map((task) => (
                                        <SortableTaskItem
                                            key={task.id}
                                            task={task}
                                            roadmapId={id}
                                            onDelete={deleteTask}
                                            onEdit={(t) => {
                                                setEditingTask(t);
                                                setTaskFormData(t);
                                                setIsTaskModalOpen(true);
                                            }}
                                        />
                                    ))
                                ) : (
                                    <Card isDark={true} className="p-12 text-center border-dashed border border-zinc-700 bg-zinc-900/20 rounded-lg shadow-none">
                                        <p className="text-zinc-500 text-sm">No tasks yet. Start building your path.</p>
                                    </Card>
                                )}
                            </SortableContext>
                        </DndContext>
                    </section>
                </div>
            </div>

            {/* Task Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-950 w-full max-w-lg rounded-lg shadow-xl border border-zinc-800 p-6 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsTaskModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <form onSubmit={handleTaskSubmit} className="space-y-5">
                            <h2 className="text-xl font-semibold tracking-tight text-zinc-100 mb-2">
                                {editingTask ? "Edit Task" : "Add New Task"}
                            </h2>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-zinc-300">Title</Label>
                                <Input
                                    value={taskFormData.title}
                                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Learn Linked Lists"
                                    className="rounded-md border-zinc-800 bg-zinc-900/50 text-zinc-100 text-sm placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-zinc-300">Description</Label>
                                <Textarea
                                    value={taskFormData.description}
                                    onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                                    placeholder="Explain what needs to be done..."
                                    className="rounded-md border-zinc-800 min-h-[100px] bg-zinc-900/50 text-zinc-100 text-sm resize-none placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-zinc-300">Duration</Label>
                                    <Input
                                        value={taskFormData.duration}
                                        onChange={(e) => setTaskFormData({ ...taskFormData, duration: e.target.value })}
                                        placeholder="e.g. 2 hours"
                                        className="rounded-md border-zinc-800 bg-zinc-900/50 text-zinc-100 text-sm placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-zinc-300">Type</Label>
                                    <div className="relative">
                                        <select
                                            value={taskFormData.type}
                                            onChange={(e) => setTaskFormData({ ...taskFormData, type: e.target.value as any })}
                                            className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer appearance-none"
                                        >
                                            <option value="info">Info</option>
                                            <option value="problem">Problem</option>
                                            <option value="guide">Guide</option>
                                            <option value="goal">Goal</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-zinc-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsTaskModalOpen(false)}
                                    className="flex-1 rounded-md text-zinc-300 font-medium hover:bg-zinc-800 hover:text-white border-zinc-800 bg-transparent h-9"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 rounded-md bg-indigo-600 hover:bg-indigo-700 font-medium text-white shadow-sm h-9 border-0"
                                >
                                    {editingTask ? "Save Task" : "Add Task"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <RegenerateModal 
                isOpen={isRegenerateModalOpen}
                onClose={() => setIsRegenerateModalOpen(false)}
                onSubmit={handleRegenerate}
                loading={regenerating}
            />
        </div>
    );
}
