"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { fetchBackend } from "@/lib/api";

interface Deadline {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  status: string;
  type: string;
  roadmapId?: string;
  taskId?: string;
  deliverableId?: number;
}

interface Roadmap {
  id: string;
  title: string;
  tasks?: Task[];
}

interface Task {
  id: string;
  title: string;
  deliverables?: { title: string; completed: boolean }[];
}

interface DeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editDeadline?: Deadline | null;
}

function DatePickerField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  const formatted = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          w-full flex items-center gap-2 bg-zinc-950 border rounded-md h-10 px-3 text-sm text-left transition-colors
          ${open ? "border-indigo-500 ring-1 ring-indigo-500/20" : "border-zinc-800 hover:border-zinc-700"}
          ${formatted ? "text-zinc-100" : "text-zinc-500"}
        `}
      >
        <CalendarIcon className="w-4 h-4 text-zinc-500 shrink-0" />
        <span className="truncate">{formatted || "Pick a date"}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl shadow-black/40 p-3 w-[280px] animate-in fade-in slide-in-from-top-2 duration-150">
          <Calendar
            selected={selectedDate}
            onSelect={(d) => {
              // Format as YYYY-MM-DD
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, "0");
              const dd = String(d.getDate()).padStart(2, "0");
              onChange(`${yyyy}-${mm}-${dd}`);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

export function DeadlineModal({ isOpen, onClose, onSuccess, editDeadline }: DeadlineModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [type, setType] = useState("general");
  const [roadmapId, setRoadmapId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [deliverableId, setDeliverableId] = useState<number>(-1);

  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (editDeadline) {
        setTitle(editDeadline.title);
        setDescription(editDeadline.description || "");
        setTargetDate(new Date(editDeadline.targetDate).toISOString().split('T')[0]);
        setType(editDeadline.type);
        setRoadmapId(editDeadline.roadmapId || "");
        setTaskId(editDeadline.taskId || "");
        setDeliverableId(editDeadline.deliverableId ?? -1);
      } else {
        setTitle("");
        setDescription("");
        setTargetDate("");
        setType("general");
        setRoadmapId("");
        setTaskId("");
        setDeliverableId(-1);
      }
      fetchOwnedRoadmaps();
    }
  }, [isOpen, editDeadline]);

  const fetchOwnedRoadmaps = async () => {
    try {
      const res = await fetchBackend("/roadmaps");
      const data = await res.json();
      setRoadmaps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch roadmaps:", err);
    }
  };

  useEffect(() => {
    if (roadmapId) {
      fetchBackend(`/roadmaps/${roadmapId}`)
        .then(res => res.json())
        .then(data => {
            if (data.tasks) setTasks(data.tasks);
        });
    } else {
      setTasks([]);
    }
  }, [roadmapId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      description,
      targetDate: new Date(targetDate).toISOString(),
      type,
      roadmapId: type === 'roadmap' || type === 'task' || type === 'deliverable' ? roadmapId : null,
      taskId: type === 'task' || type === 'deliverable' ? taskId : null,
      deliverableId: type === 'deliverable' ? (deliverableId >= 0 ? deliverableId : null) : null,
    };

    try {
      const url = editDeadline ? `/deadlines/${editDeadline.id}` : "/deadlines";
      const method = editDeadline ? "PATCH" : "POST";
      const res = await fetchBackend(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Failed to save deadline:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-lg rounded-lg shadow-2xl border border-zinc-800 overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 font-sans text-zinc-50">
          <div className="mb-6 flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-500/10 rounded-md border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <CalendarIcon className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-xl font-semibold tracking-tight">{editDeadline ? "Edit Deadline" : "Set Deadline"}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Keep track of your learning milestones.</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-medium text-zinc-300">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Backend Logic"
                required
                className="bg-zinc-950 border-zinc-800 focus:border-indigo-500 text-sm h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 relative">
                <Label htmlFor="date" className="text-sm font-medium text-zinc-300">Target Date</Label>
                <DatePickerField
                  value={targetDate}
                  onChange={setTargetDate}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-zinc-300">Track Item</Label>
                <select 
                   value={type} 
                   onChange={(e) => setType(e.target.value)}
                   className="w-full bg-zinc-950 border border-zinc-800 rounded-md h-10 px-3 text-sm focus:border-indigo-500 outline-none text-zinc-100"
                >
                    <option value="general">General Goal</option>
                    <option value="roadmap">Roadmap</option>
                    <option value="task">Individual Task</option>
                    <option value="deliverable">Specific Deliverable</option>
                </select>
              </div>
            </div>

            {type !== 'general' && (
              <div className="space-y-4 p-4 rounded-md bg-zinc-950/50 border border-zinc-800/50">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-zinc-400">Select Roadmap</Label>
                  <select 
                     value={roadmapId} 
                     onChange={(e) => setRoadmapId(e.target.value)}
                     className="w-full bg-zinc-900 border border-zinc-800 rounded-md h-9 px-3 text-xs focus:border-indigo-500 outline-none text-zinc-100"
                  >
                      <option value="">Choose roadmap...</option>
                      {roadmaps.map(rm => <option key={rm.id} value={rm.id}>{rm.title}</option>)}
                  </select>
                </div>

                {(type === 'task' || type === 'deliverable') && roadmapId && (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-zinc-400">Select Task</Label>
                    <select 
                      value={taskId} 
                      onChange={(e) => setTaskId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md h-9 px-3 text-xs focus:border-indigo-500 outline-none text-zinc-100"
                    >
                        <option value="">Choose task...</option>
                        {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                  </div>
                )}

                {type === 'deliverable' && taskId && (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-zinc-400">Select Deliverable</Label>
                    <select 
                      value={deliverableId} 
                      onChange={(e) => setDeliverableId(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md h-9 px-3 text-xs focus:border-indigo-500 outline-none text-zinc-100"
                    >
                        {tasks.find(t => t.id === taskId)?.deliverables?.map((d: any, idx) => (
                            <option key={idx} value={idx}>{typeof d === 'string' ? d : (d.title || d[0])}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="desc" className="text-sm font-medium text-zinc-300">Notes (Optional)</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about what needs to be done"
                className="bg-zinc-950 border-zinc-800 focus:border-indigo-500 text-sm h-10"
              />
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-md border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                className="flex-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold border-0 shadow-lg shadow-indigo-600/20"
              >
                {loading ? "Saving..." : (editDeadline ? "Update Deadline" : "Set Deadline")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
