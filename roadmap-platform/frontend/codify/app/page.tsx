"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchBackend } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Target, Zap, TrendingUp, Code2, Rocket } from "lucide-react";

type Track = {
  icon: string;
  name: string;
  id: number;
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBackend("/tracks")
      .then((res) => res.json())
      .then((data) => {
        setTracks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
              Master Your <span className="text-blue-600">CS Career</span> Path
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Skip the guesswork. Get a personalized roadmap tailored to your goals,
              skill level, and interview timeline.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/onboarding">
                <Button size="lg" className="px-8 py-7 rounded-2xl text-lg font-bold shadow-xl shadow-blue-100 gap-2">
                  Get My Roadmap
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="px-8 py-7 rounded-2xl text-lg font-bold border-2">
                  Explore Tracks
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Everything you need to succeed</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our platform combines AI-driven personalization with curated industry standards
              to give you the most efficient prep plan possible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: <Target className="w-8 h-8 text-blue-600" />,
                title: "Personalized Goals",
                desc: "We adapt to your specific interview timeline and target roles."
              },
              {
                icon: <Zap className="w-8 h-8 text-amber-500" />,
                title: "Accelerated Prep",
                desc: "Focus only on what matters. Cut out the noise and master the core concepts."
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-emerald-500" />,
                title: "Track Progress",
                desc: "Visualize your journey and stay motivated with real-time feedback."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="mb-6 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks Preview */}
      <section id="roadmap" className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-16 italic underline decoration-blue-500 underline-offset-8">Featured Tracks</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-3xl" />
              ))
            ) : tracks.length > 0 ? (
              tracks.map((track) => (
                <div
                  key={track.id}
                  className="group relative overflow-hidden rounded-3xl bg-slate-50 p-8 text-left transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 border border-transparent hover:border-slate-100"
                >
                  <div className="mb-4 text-5xl transition-transform group-hover:scale-110 group-hover:rotate-6 inline-block">{track.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{track.name}</h3>
                  <div className="flex items-center text-blue-600 font-semibold text-sm">
                    View Roadmap <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-12 text-slate-500">
                <Code2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Curating the latest industry tracks...</p>
              </div>
            )}
          </div>

          <div className="mt-16">
            <Link href="/signup">
              <Button size="lg" className="px-10 py-7 rounded-2xl font-bold shadow-lg shadow-blue-100 flex items-center gap-2 mx-auto">
                Start Your Path Now
                <Rocket className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© 2026 Codify. Building the future of technical interview prep.</p>
        </div>
      </footer>
    </div>
  );
}

