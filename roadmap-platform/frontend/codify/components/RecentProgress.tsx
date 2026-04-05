"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { fetchBackend } from "@/lib/api";
import { 
    CheckCircle2, 
    Trophy, 
    Clock, 
    ChevronRight,
    Milestone,
    Sparkles
} from "lucide-react";
import { format, isToday, isYesterday, parseISO, startOfToday, subDays } from "date-fns";

interface Achievement {
    id: string;
    type: "task" | "deliverable";
    title: string;
    taskTitle?: string;
    roadmapTitle: string;
    completedAt: string;
}

export function RecentProgress() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const res = await fetchBackend("/recent-progress");
                if (res.ok) {
                    const data = await res.json();
                    setAchievements(data);
                }
            } catch (err) {
                console.error("Error loading recent progress:", err);
            } finally {
                setLoading(false);
            }
        };
        loadProgress();
    }, []);

    const formatDate = (dateStr: string) => {
        const date = parseISO(dateStr);
        if (isToday(date)) return "Today";
        if (isYesterday(date)) return "Yesterday";
        return format(date, "MMM d, yyyy");
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-zinc-900/40 rounded-lg border border-zinc-800" />
                ))}
            </div>
        );
    }

    if (achievements.length === 0) {
        return (
            <Card isDark={true} className="p-10 border-dashed border-zinc-800 bg-zinc-900/10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 mb-4">
                    <Milestone className="w-6 h-6" />
                </div>
                <h4 className="text-zinc-300 font-medium mb-1">No recent activity</h4>
                <p className="text-zinc-500 text-sm max-w-[200px]">Complete some tasks to see your progress here.</p>
            </Card>
        );
    }

    // Group by date
    const grouped = achievements.reduce((acc, curr) => {
        const dateKey = formatDate(curr.completedAt);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(curr);
        return acc;
    }, {} as Record<string, Achievement[]>);

    return (
        <div className="space-y-8">
            {Object.entries(grouped).map(([date, items]) => (
                <div key={date} className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{date}</span>
                        <div className="h-px flex-1 bg-zinc-800/50" />
                    </div>
                    
                    <div className="space-y-3">
                        {items.map((item) => (
                            <Card 
                                key={item.id} 
                                isDark={true} 
                                className="group p-4 bg-zinc-900/40 border-zinc-800/80 hover:border-indigo-500/30 hover:bg-zinc-900/60 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                        item.type === 'task' 
                                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    }`}>
                                        {item.type === 'task' ? <Trophy className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-4">
                                            <h4 className="text-[15px] font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors truncate">
                                                {item.title}
                                            </h4>
                                            <span className="text-[10px] whitespace-nowrap text-zinc-500 font-mono">
                                                {format(parseISO(item.completedAt), "HH:mm")}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-zinc-500 truncate flex items-center gap-1.5">
                                                {item.roadmapTitle}
                                                {item.taskTitle && (
                                                    <>
                                                        <ChevronRight className="w-3 h-3 opacity-50" />
                                                        <span className="opacity-80">{item.taskTitle}</span>
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {item.type === 'task' && (
                                        <div className="shrink-0 scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                                            <Sparkles className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
