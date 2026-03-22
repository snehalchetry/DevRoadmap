"use client";

import { motion } from "framer-motion";
import { Github, Map, Sparkles } from "lucide-react";
import { UsernameInput } from "@/components/UsernameInput";

const backgroundSnippets = [
  {
    text: "git commit -m \"ship the roadmap\"",
    style: { top: "18%", left: "8%" }
  },
  {
    text: "npm install reactflow framer-motion",
    style: { top: "22%", right: "8%" }
  },
  {
    text: "const roadmap = await generatePlan(user)",
    style: { bottom: "24%", left: "14%" }
  },
  {
    text: "if (gaps.length) learnNext(gaps[0])",
    style: { bottom: "16%", right: "12%" }
  }
];

const features = [
  {
    icon: Github,
    title: "Analyzes your GitHub",
    description: "Repositories, language mix, contribution signals, and shipping patterns."
  },
  {
    icon: Sparkles,
    title: "AI finds your gaps",
    description: "Gemini turns your public work into a direct, personalized learning strategy."
  },
  {
    icon: Map,
    title: "Visual roadmap",
    description: "A category-colored learning graph with dependencies, priorities, and resources."
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 }
};

export default function HomePage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-5 pb-16 pt-8 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0">
        {backgroundSnippets.map((snippet, index) => (
          <motion.span
            key={snippet.text}
            initial={false}
            animate={{ opacity: 0.18 }}
            transition={{ duration: 0.9, delay: index * 0.08 }}
            className="absolute font-mono text-[11px] tracking-[0.08em] text-white/10"
            style={snippet.style}
          >
            {snippet.text}
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1440px] flex-col justify-between">
        <motion.header
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
              <span className="editorial-title text-lg text-[var(--text-primary)]">D</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">DevRoadmap.live</p>
              <p className="text-xs text-[var(--text-muted)]">AI career signal extraction</p>
            </div>
          </div>

          <div className="hidden rounded-full border border-[rgba(109,183,255,0.26)] bg-[rgba(109,183,255,0.08)] px-4 py-2 text-[13px] font-medium text-[var(--accent)] md:inline-flex">
            Powered by Gemini AI
          </div>
        </motion.header>

        <section className="py-12 sm:py-16 lg:py-20">
          <div className="grid items-end gap-14 lg:grid-cols-[minmax(0,1.05fr)_420px]">
            <motion.div
              variants={container}
              initial={false}
              animate="show"
              className="max-w-[820px]"
            >
              <motion.p variants={item} className="editorial-kicker">
                Personalized developer trajectory
              </motion.p>
              <motion.h1
                variants={item}
                className="editorial-title mt-5 text-balance text-[clamp(3.4rem,8vw,7rem)] leading-[0.94]"
              >
                Know exactly
                <br />
                <span className="text-gradient">what to learn next.</span>
              </motion.h1>
              <motion.p
                variants={item}
                className="mt-8 max-w-[650px] text-balance text-[1.05rem] leading-8 text-[var(--text-secondary)] sm:text-[1.18rem]"
              >
                Enter your GitHub username. DevRoadmap.live reads your public repos,
                contribution rhythm, and language patterns, then builds an interactive
                roadmap of the highest-leverage skills to learn next.
              </motion.p>

              <motion.div variants={item} className="mt-10 max-w-[760px]">
                <UsernameInput />
              </motion.div>

              <motion.div
                variants={item}
                className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]"
              >
                <span className="pill">No setup friction</span>
                <span className="pill">Public GitHub only</span>
                <span className="pill">Shareable roadmap URL</span>
              </motion.div>
            </motion.div>

            <motion.aside
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="glass-card-strong mesh-panel relative overflow-hidden p-6 lg:p-7"
            >
              <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <p className="editorial-kicker">What the engine sees</p>
              <div className="mt-6 space-y-4">
                <div className="glass-card border-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Signal extraction
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    Repo density, activity consistency, architecture tendencies, and likely missing discipline areas.
                  </p>
                </div>
                <div className="glass-card border-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Output format
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    A category-coded learning map with dependencies, priorities, time estimates, and curated resources.
                  </p>
                </div>
                <div className="glass-card border-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Shareability
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    Every generated roadmap is designed to live at a clean shareable route like <span className="text-[var(--text-primary)]">/snehalchetry</span>.
                  </p>
                </div>
              </div>
            </motion.aside>
          </div>
        </section>

        <motion.section
          variants={container}
          initial={false}
          animate="show"
          className="pb-6"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  variants={item}
                  className="glass-card glass-card-hover p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(109,183,255,0.16)] bg-[rgba(109,183,255,0.08)]">
                    <Icon className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <p className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                    {feature.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.footer
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3 border-t border-white/6 py-6 text-[13px] text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between"
        >
          <p>Open source. Dark glassmorphism. Product-grade by default.</p>
          <p>Next.js 14 · Gemini AI · GitHub GraphQL · Supabase</p>
        </motion.footer>
      </div>
    </main>
  );
}
