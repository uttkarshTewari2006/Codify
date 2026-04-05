"use client";

import { ArrowRight, Code2, Brain, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CuratedRoadmapsDisplay } from "@/components/CuratedRoadmapsDisplay";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      {/* Navigation */}
      <nav className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-indigo-500" />
            <span className="font-mono font-bold tracking-tight text-lg">Codify</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-zinc-300 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-zinc-300 transition-colors">How it Works</a>
            <Button
              onClick={handleGetStarted}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm h-9 px-4 font-medium"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-zinc-800 bg-zinc-900 mb-6">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">AI-Powered Personalization</span>
            </div>
            <h1 className="text-5xl font-semibold mb-6 tracking-tight leading-tight">
              Interview Prep That
              <br />
              <span className="text-indigo-500">Adapts to You</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-lg">
              Stop grinding generic problems. Get a personalized study plan powered by AI that understands your level, weaknesses, and goals.
            </p>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm group h-12 px-6 font-medium"
              >
                Start Your Plan
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-zinc-800 bg-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-md h-12 px-6 font-medium"
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
                <div className="text-2xl font-mono font-semibold text-zinc-100">∞</div>
                <div className="mt-1">Community Learning</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
            <div className="relative w-full aspect-[4/3] rounded-lg border border-zinc-800 shadow-2xl overflow-hidden bg-zinc-900">
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

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24 border-t border-zinc-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">Why Codify is Different</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            No more one-size-fits-all prep courses. Our platform uses advanced AI technology to create plans that actually match your needs.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors">
            <div className="h-12 w-12 rounded-md bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
              <Brain className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-medium mb-3">AI-Powered Personalization</h3>
            <p className="text-zinc-400 leading-relaxed">
              AI that retrieves context about your level, weaknesses, and goals to generate truly personalized study plans.
            </p>
          </div>
          <div className="p-8 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors">
            <div className="h-12 w-12 rounded-md bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-medium mb-3">Community-Driven AI</h3>
            <p className="text-zinc-400 leading-relaxed">
              Problem ratings and comments feed back into the AI, making recommendations smarter with every interaction.
            </p>
          </div>
          <div className="p-8 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors">
            <div className="h-12 w-12 rounded-md bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-medium mb-3">Adaptive Learning</h3>
            <p className="text-zinc-400 leading-relaxed">
              Plans regenerate based on your feedback about difficulty, ensuring optimal challenge level throughout your prep.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 border-t border-zinc-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">How It Works</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Get started in minutes with our curated intake flow, then dive into your personalized study plan.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Answer 5 Questions", desc: "Tell us about your level, goals, and constraints" },
            { step: "02", title: "Get Your Plan", desc: "Receive a personalized 2-4 week study roadmap" },
            { step: "03", title: "Practice & Engage", desc: "Work through problems and engage with community" },
            { step: "04", title: "Adapt & Improve", desc: "Regenerate plans based on your feedback" },
          ].map((item) => (
            <div key={item.step} className="text-center p-6 rounded-lg border border-zinc-800/50 bg-zinc-900/20">
              <div className="text-4xl font-mono font-bold text-indigo-500 mb-4">{item.step}</div>
              <h3 className="text-lg font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Roadmaps Section */}
      <section id="curated-roadmaps" className="mx-auto max-w-7xl px-6 py-24 border-t border-zinc-900 bg-zinc-950/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">Explore Pre-Curated Roadmaps</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg mb-12">
            Not ready to generate a personalized plan? Explore our expert-curated paths covering interview prep, project building, and networking.
          </p>
          <div className="text-left">
            <CuratedRoadmapsDisplay />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 border-t border-zinc-900">
        <div className="text-center max-w-2xl mx-auto bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
          <div className="relative z-10">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">Ready to ace your interviews?</h2>
            <p className="text-lg text-indigo-200/70 mb-8 max-w-xl mx-auto">
              Join thousands of developers who prep smarter, not harder. Start building your personalized path today.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm h-12 px-8 font-medium"
            >
              Start Your Free Plan
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Code2 className="h-5 w-5" />
              <span className="font-mono font-semibold text-sm">Codify</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
            </div>
            <div className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Codify. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
