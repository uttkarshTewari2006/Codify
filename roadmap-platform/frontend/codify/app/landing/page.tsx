"use client";

import { ArrowRight, Brain, Code2, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { CuratedRoadmapsDisplay } from "@/components/CuratedRoadmapsDisplay";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <nav className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-indigo-500" />
            <span className="font-mono text-lg font-bold tracking-tight">Codify</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium transition-colors hover:text-zinc-300">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium transition-colors hover:text-zinc-300">
              How it Works
            </a>
            <Button
              onClick={handleGetStarted}
              className="h-9 rounded-md bg-indigo-600 px-4 font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-300">
                AI-Powered Personalization
              </span>
            </div>
            <h1 className="mb-6 text-5xl font-semibold leading-tight tracking-tight">
              Interview Prep That
              <br />
              <span className="text-indigo-500">Adapts to You</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-zinc-400">
              Stop grinding generic problems. Get a personalized study plan powered by AI
              that understands your level, weaknesses, and goals.
            </p>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="group h-12 rounded-md bg-indigo-600 px-6 font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Start Your Plan
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-md border-zinc-800 bg-zinc-800 px-6 font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                Learn More
              </Button>
            </div>
            <div className="mt-12 flex items-center gap-8 text-sm text-zinc-500">
              <div>
                <div className="text-2xl font-mono font-semibold text-zinc-100">2-4</div>
                <div className="mt-1">Week Plans</div>
              </div>
              <div className="h-10 w-px bg-zinc-800" />
              <div>
                <div className="text-2xl font-mono font-semibold text-zinc-100">5Q</div>
                <div className="mt-1">Curated Intake</div>
              </div>
              <div className="h-10 w-px bg-zinc-800" />
              <div>
                <div className="text-2xl font-mono font-semibold text-zinc-100">RAG</div>
                <div className="mt-1">Grounded Resources</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl">
              <Image
                src="/developer_workspace.png"
                alt="Developer workspace"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl border-t border-zinc-900 px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight">Why Codify is Different</h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            No more one-size-fits-all prep courses. Our platform uses advanced AI technology
            to create plans that actually match your needs.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 transition-colors hover:bg-zinc-900/80">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md border border-indigo-500/20 bg-indigo-500/10">
              <Brain className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="mb-3 text-xl font-medium">AI-Powered Personalization</h3>
            <p className="leading-relaxed text-zinc-400">
              AI retrieves context about your level, weaknesses, and goals to generate a
              personalized study plan.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 transition-colors hover:bg-zinc-900/80">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md border border-indigo-500/20 bg-indigo-500/10">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="mb-3 text-xl font-medium">Curated Resource Grounding</h3>
            <p className="leading-relaxed text-zinc-400">
              Retrieved knowledge documents carry explicit learning links so roadmap tasks can
              point back to real resources instead of guessed URLs.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 transition-colors hover:bg-zinc-900/80">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md border border-indigo-500/20 bg-indigo-500/10">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="mb-3 text-xl font-medium">Adaptive Learning</h3>
            <p className="leading-relaxed text-zinc-400">
              Plans regenerate based on your feedback about difficulty, keeping the roadmap
              aligned with what you actually need next.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl border-t border-zinc-900 px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight">How It Works</h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Get started in minutes with the intake flow, then work through a personalized
            roadmap with grounded resource links.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {[
            { step: "01", title: "Answer 5 Questions", desc: "Tell us about your level, goals, and constraints" },
            { step: "02", title: "Get Your Plan", desc: "Receive a personalized 2-4 week study roadmap" },
            { step: "03", title: "Practice & Build", desc: "Work through tasks, links, and curated roadmap steps" },
            { step: "04", title: "Adapt & Improve", desc: "Regenerate plans based on your feedback" },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-lg border border-zinc-800/50 bg-zinc-900/20 p-6 text-center"
            >
              <div className="mb-4 font-mono text-4xl font-bold text-indigo-500">{item.step}</div>
              <h3 className="mb-2 text-lg font-medium">{item.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="curated-roadmaps"
        className="mx-auto max-w-7xl border-t border-zinc-900 bg-zinc-950/50 px-6 py-24"
      >
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight">Explore Pre-Curated Roadmaps</h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-zinc-400">
            Not ready to generate a personalized plan? Explore expert-curated paths covering
            interview prep, project building, and networking.
          </p>
          <div className="text-left">
            <CuratedRoadmapsDisplay />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t border-zinc-900 px-6 py-24">
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-900/20 p-12 text-center">
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight">Ready to ace your interviews?</h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-indigo-200/70">
              Start building a personalized path with grounded learning resources and an
              editable roadmap.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="h-12 rounded-md bg-indigo-600 px-8 font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Start Your Free Plan
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-zinc-400">
              <Code2 className="h-5 w-5" />
              <span className="font-mono text-sm font-semibold">Codify</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <a href="#" className="transition-colors hover:text-zinc-300">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-zinc-300">
                Terms of Service
              </a>
            </div>
            <div className="text-sm text-zinc-500">© {new Date().getFullYear()} Codify. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
