import Link from "next/link";
import { Layout, Settings, ChevronRight, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type Roadmap = {
    id: string;
    title: string;
    description: string;
    createdAt?: string;
};

interface RoadmapCardProps {
    roadmap: Roadmap;
    showEdit?: boolean;
    onDelete?: (id: string) => void;
}

export function RoadmapCard({ roadmap, showEdit = true, onDelete }: RoadmapCardProps) {
    return (
        <Card className="group p-6 rounded-lg hover:border-indigo-500/40 transition-colors flex flex-col min-h-[200px] relative overflow-hidden">
            {onDelete && (
                <Button
                    variant="ghost"
                    onClick={(e) => {
                        e.preventDefault();
                        onDelete(roadmap.id);
                    }}
                    className="absolute top-4 right-4 h-8 w-8 p-0 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/10 hover:text-rose-400 z-10"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            )}
            <div className="flex items-start gap-4 mb-3 pr-8">
                <div className="w-12 h-12 rounded-md bg-indigo-900/50 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/30">
                    <Layout className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                    <h3 className="text-base font-semibold truncate text-indigo-50">{roadmap.title}</h3>
                    <p className="text-sm text-indigo-200/70 mt-1 line-clamp-2 leading-relaxed">
                        {roadmap.description || "Personalized learning path"}
                    </p>
                </div>
            </div>

            <div className="mt-auto flex items-center gap-2 pt-4">
                {showEdit && (
                    <Link href={`/roadmaps/${roadmap.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full h-10 rounded-md text-sm font-medium bg-transparent border-indigo-500/30 hover:bg-indigo-900/50 hover:text-indigo-100 text-indigo-300">
                            <Settings className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                )}
                <Link href={`/roadmaps/${roadmap.id}`} className="flex-1">
                    <Button className="w-full h-10 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium border-0">
                        View
                        <ChevronRight className="w-4 h-4 ml-2 opacity-70" />
                    </Button>
                </Link>
            </div>
        </Card>
    );
}
