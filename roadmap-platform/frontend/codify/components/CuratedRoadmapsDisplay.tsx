"use client";
import { useState, useEffect } from "react";

import { fetchBackend } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brain, Code2, PlayCircle, Library, CheckCircle2 } from "lucide-react";

interface CuratedTask {
  title: string;
  description: string;
  duration: string;
  type: string;
  deliverables?: [string, boolean][];
  links?: string[];
}

interface CuratedRoadmap {
  roadmap_title: string;
  category: string;
  description: string;
  tasks: CuratedTask[];
}

export function CuratedRoadmapsDisplay() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<CuratedRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [forkingId, setForkingId] = useState<number | null>(null);

  const handleFork = async (roadmap: CuratedRoadmap, index: number) => {
    if (forkingId !== null) return;
    setForkingId(index);
    try {
      const res = await fetchBackend("/roadmaps/fork-curated", {
        method: "POST",
        body: JSON.stringify({ roadmap }),
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Forking failed:", err);
    } finally {
      setForkingId(null);
    }
  };

  useEffect(() => {
    fetchBackend("/curated-roadmaps")
      .then((res) => res.json())
      .then((data) => {
        if (data?.curated_roadmaps) {
          setRoadmaps(data.curated_roadmaps);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch curated roadmaps:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!roadmaps.length) return null;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {roadmaps.map((rm, idx) => {
        const isExpanded = expandedId === idx;
        const iconColor =
          rm.category === "Interview Prep" ? "text-blue-400" :
          rm.category === "Networking Guides" ? "text-emerald-400" : "text-purple-400";
        const bgIcon =
          rm.category === "Interview Prep" ? "bg-blue-500/10" :
          rm.category === "Networking Guides" ? "bg-emerald-500/10" : "bg-purple-500/10";
        
        const Icon = 
            rm.category === "Interview Prep" ? Code2 :
            rm.category === "Networking Guides" ? Library : Brain;

        return (
          <Card 
            key={idx} 
            className="overflow-hidden border-zinc-800 bg-zinc-900/40 hover:border-indigo-500/50 transition-all"
          >
            <div 
              className="p-6 cursor-pointer flex gap-4"
              onClick={() => setExpandedId(isExpanded ? null : idx)}
            >
              <div className={`shrink-0 w-12 h-12 rounded-xl ${bgIcon} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg text-zinc-100">{rm.roadmap_title}</h3>
                  <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800/50 px-2.5 py-0.5 text-xs font-semibold text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2">
                    {rm.category}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                  {rm.description}
                </p>
                
                {!isExpanded && (
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-indigo-400 font-medium flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      View {rm.tasks.length} Modules
                    </div>
                    {status === "authenticated" && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 px-3 text-xs bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/20"
                        disabled={forkingId !== null}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleFork(rm, idx);
                        }}
                      >
                        {forkingId === idx ? "Forking..." : "Fork Roadmap"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="px-6 pb-6 pt-2 border-t border-zinc-800/50 bg-zinc-950/30">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 mt-4">Modules</h4>
                <div className="space-y-4">
                  {rm.tasks.map((task, tIdx) => (
                    <div key={tIdx} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-zinc-200 text-sm">{task.title}</h5>
                        {task.duration && (
                          <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 whitespace-nowrap">
                            {task.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mb-3">{task.description}</p>
                      
                      {task.deliverables && task.deliverables.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-semibold text-zinc-500 mb-2">Deliverables:</p>
                          <ul className="text-xs text-zinc-300 space-y-1 pl-4 list-disc marker:text-zinc-700">
                            {task.deliverables.map((del, dIdx) => (
                              <li key={dIdx}>{del[0]}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
