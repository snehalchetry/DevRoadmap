"use client";

import { motion } from "framer-motion";
import { Calendar, Code2, GitCommit, GitFork } from "lucide-react";
import { formatCompactNumber, formatGitHubSince, getTopLanguage } from "@/lib/utils";
import type { GitHubProfileData } from "@/types";

interface StatsRowProps {
  githubData: GitHubProfileData;
}

export function StatsRow({ githubData }: StatsRowProps) {
  const metrics = [
    {
      label: "Public Repos",
      value: formatCompactNumber(githubData.publicRepos),
      icon: GitFork
    },
    {
      label: "Top Language",
      value: getTopLanguage(githubData.languageBreakdown),
      icon: Code2
    },
    {
      label: "Total Commits",
      value: formatCompactNumber(githubData.contributionCommits),
      icon: GitCommit
    },
    {
      label: "GitHub Since",
      value: formatGitHubSince(githubData.createdAt),
      icon: Calendar
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;

        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
            className="glass-card glass-card-hover mesh-panel p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {metric.label}
                </p>
                <p className="mt-4 text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                  {metric.value}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(109,183,255,0.16)] bg-[rgba(109,183,255,0.08)]">
                <Icon className="h-5 w-5 text-[var(--accent)]" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
