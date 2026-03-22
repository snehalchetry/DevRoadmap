"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  ShieldAlert
} from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { RoadmapGraph } from "@/components/RoadmapGraph";
import { ShareButton } from "@/components/ShareButton";
import { StatsRow } from "@/components/StatsRow";
import { LEVEL_STYLES, type RoadmapApiResponse } from "@/types";
import { cn, formatRelativeTime, sanitizeGitHubUsername } from "@/lib/utils";

interface UsernamePageProps {
  params: {
    username: string;
  };
}

interface PageErrorState {
  title: string;
  description: string;
  icon?: "warning" | "danger";
}

async function toErrorState(
  response: Response,
  username: string
): Promise<PageErrorState> {
  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  const description = payload?.error ?? "An unexpected error interrupted the roadmap request.";

  if (response.status === 404) {
    return {
      title: "Profile unavailable",
      description:
        description === "No cached roadmap found for this username."
          ? `No fresh cached roadmap exists for @${username}, and a live analysis could not be completed.`
          : description,
      icon: "warning"
    };
  }

  if (response.status === 429) {
    return {
      title: "Rate limit reached",
      description,
      icon: "warning"
    };
  }

  return {
    title: "Roadmap generation failed",
    description,
    icon: "danger"
  };
}

export default function UsernamePage({ params }: UsernamePageProps) {
  const username = useMemo(
    () => sanitizeGitHubUsername(params.username),
    [params.username]
  );
  const [roadmapResponse, setRoadmapResponse] = useState<RoadmapApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<PageErrorState | null>(null);
  const [timeTick, setTimeTick] = useState(Date.now());
  const [loadingProgress, setLoadingProgress] = useState(8);
  const [loadingStatus, setLoadingStatus] = useState("Checking for cached roadmap...");

  const finishLoading = useCallback(
    async (nextResponse?: RoadmapApiResponse | null, nextError?: PageErrorState | null) => {
      setLoadingStatus(nextError ? "Preparing error state..." : "Finalizing roadmap...");
      setLoadingProgress(100);

      await new Promise((resolve) => window.setTimeout(resolve, 320));

      if (nextResponse !== undefined) {
        setRoadmapResponse(nextResponse);
      }

      if (nextError) {
        setError(nextError);
      }

      setLoading(false);
      setRefreshing(false);
    },
    []
  );

  const loadRoadmap = useCallback(
    async (force = false) => {
      let liveProgressTimer: number | null = null;

      if (force) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      setLoadingProgress(force ? 12 : 8);
      setLoadingStatus(force ? "Refreshing roadmap..." : "Checking for cached roadmap...");

      try {
        if (!force) {
          const cachedResponse = await fetch(
            `/api/roadmap/${encodeURIComponent(username)}`,
            {
              cache: "no-store"
            }
          );

          if (cachedResponse.ok) {
            const cachedData = (await cachedResponse.json()) as RoadmapApiResponse;
            setLoadingStatus("Cached roadmap found.");
            setLoadingProgress(100);
            await new Promise((resolve) => window.setTimeout(resolve, 180));
            setRoadmapResponse(cachedData);
            setLoading(false);
            setRefreshing(false);
            return;
          }

          if (cachedResponse.status !== 404) {
            await finishLoading(undefined, await toErrorState(cachedResponse, username));
            return;
          }
        }

        setLoadingStatus("Fetching GitHub profile...");
        setLoadingProgress((current) => Math.max(current, 18));

        const stageMessages = [
          "Fetching GitHub profile...",
          "Mapping contribution velocity...",
          "Analyzing language signatures...",
          "Generating your learning graph..."
        ];
        const stageProgressCaps = [28, 48, 68, 88];
        const startedAt = Date.now();

        liveProgressTimer = window.setInterval(() => {
          const elapsed = Date.now() - startedAt;
          const stageIndex = Math.min(
            Math.floor(elapsed / 1800),
            stageMessages.length - 1
          );
          const cap = stageProgressCaps[stageIndex] ?? 88;
          setLoadingStatus(stageMessages[stageIndex] ?? "Generating your learning graph...");
          setLoadingProgress((current) => {
            if (current >= cap) {
              return current;
            }

            const next = current + Math.max(1.2, (cap - current) * 0.08);
            return Math.min(next, cap);
          });
        }, 220);

        const analyzeResponse = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          cache: "no-store",
          body: JSON.stringify({
            username,
            force
          })
        });

        if (liveProgressTimer) {
          window.clearInterval(liveProgressTimer);
        }

        if (!analyzeResponse.ok) {
          await finishLoading(undefined, await toErrorState(analyzeResponse, username));
          return;
        }

        const analyzedData = (await analyzeResponse.json()) as RoadmapApiResponse;
        await finishLoading(analyzedData, null);
      } catch {
        if (liveProgressTimer) {
          window.clearInterval(liveProgressTimer);
        }

        await finishLoading(undefined, {
          title: "Connection problem",
          description:
            "The app could not reach the analysis API. Verify the local server and environment configuration.",
          icon: "danger"
        });
      } finally {
        if (liveProgressTimer) {
          window.clearInterval(liveProgressTimer);
        }
      }
    },
    [finishLoading, username]
  );

  useEffect(() => {
    void loadRoadmap(false);
  }, [loadRoadmap]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeTick(Date.now());
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  if (loading && !roadmapResponse) {
    return (
      <LoadingState
        username={username}
        avatarUrl={`https://github.com/${username}.png?size=128`}
        progress={loadingProgress}
        status={loadingStatus}
      />
    );
  }

  if (!roadmapResponse) {
    const isDanger = error?.icon === "danger";

    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="glass-card-strong mesh-panel w-full max-w-2xl p-8 text-center sm:p-10">
          <div
            className={cn(
              "mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border",
              isDanger
                ? "border-[rgba(255,114,114,0.22)] bg-[rgba(255,114,114,0.1)]"
                : "border-[rgba(255,176,102,0.22)] bg-[rgba(255,176,102,0.1)]"
            )}
          >
            {isDanger ? (
              <ShieldAlert className="h-7 w-7 text-[var(--danger)]" />
            ) : (
              <AlertTriangle className="h-7 w-7 text-[var(--warning)]" />
            )}
          </div>
          <h1 className="editorial-title mt-7 text-4xl text-[var(--text-primary)]">
            {error?.title ?? "Something failed."}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[var(--text-secondary)]">
            {error?.description ?? "The roadmap could not be loaded for this username."}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="button-shimmer relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-5 text-sm font-medium text-[var(--text-primary)]"
            >
              <span className="relative z-[1] inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </span>
            </Link>
            <button
              type="button"
              onClick={() => void loadRoadmap(true)}
              className="button-shimmer relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,#8ac4ff_0%,#6db7ff_44%,#7ef5c5_100%)] px-5 text-sm font-semibold text-[#07101e]"
            >
              <span className="relative z-[1]">Try again</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  const levelStyle = LEVEL_STYLES[roadmapResponse.roadmap.currentLevel];
  const generatedLabel = formatRelativeTime(roadmapResponse.updatedAt, timeTick);

  return (
    <div className="min-h-screen">
      {(loading || refreshing) && roadmapResponse ? (
        <LoadingState
          username={username}
          avatarUrl={roadmapResponse.githubData.avatarUrl}
          overlay
          progress={loadingProgress}
          status={loadingStatus}
        />
      ) : null}

      <nav className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(6,8,22,0.68)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={roadmapResponse.githubData.avatarUrl}
              alt={roadmapResponse.username}
              className="h-10 w-10 rounded-2xl border border-white/10 object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                @{roadmapResponse.username}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{
                    background: levelStyle.background,
                    color: levelStyle.text
                  }}
                >
                  {roadmapResponse.roadmap.currentLevel}
                </span>
                <span className="hidden text-xs text-[var(--text-muted)] sm:inline">
                  {generatedLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShareButton />
            <button
              type="button"
              onClick={() => void loadRoadmap(true)}
              disabled={refreshing}
              className="button-shimmer relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[rgba(109,183,255,0.24)] disabled:opacity-60"
            >
              <span className="relative z-[1] inline-flex items-center gap-2">
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                <span className="hidden sm:inline">Regenerate</span>
              </span>
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mb-6 flex items-start gap-3 border-[rgba(255,176,102,0.16)] bg-[rgba(255,176,102,0.08)] px-4 py-3"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{error.title}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{error.description}</p>
            </div>
          </motion.div>
        ) : null}

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="glass-card-strong mesh-panel mb-6 overflow-hidden p-6 sm:p-8"
        >
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-end">
            <div className="max-w-4xl">
              <p className="editorial-kicker">Personalized roadmap analysis</p>
              <h1 className="editorial-title mt-5 text-balance text-[clamp(2.6rem,5vw,5rem)] leading-[0.96] text-[var(--text-primary)]">
                The next phase of your
                <br />
                <span className="text-gradient">developer trajectory.</span>
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--text-secondary)] sm:text-[1.05rem]">
                {roadmapResponse.githubData.bio ||
                  `We analyzed ${roadmapResponse.githubData.publicRepos} public repositories, contribution intensity, and language composition to surface the next skills that will compound fastest for @${roadmapResponse.username}.`}
              </p>
            </div>

            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Primary stack
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {roadmapResponse.roadmap.primaryStack.map((item) => (
                  <span
                    key={item}
                    className="inline-flex rounded-full border border-[rgba(109,183,255,0.18)] bg-[rgba(109,183,255,0.08)] px-3 py-1.5 text-xs font-medium text-[var(--accent)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-6"
        >
          <StatsRow githubData={roadmapResponse.githubData} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="glass-card-strong mb-6 p-6 sm:p-7"
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-[var(--success)]">Strengths</p>
              <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
                {roadmapResponse.roadmap.strengths.map((strength) => (
                  <span
                    key={strength}
                    className="inline-flex whitespace-nowrap rounded-full border border-[rgba(83,216,137,0.18)] bg-[rgba(83,216,137,0.1)] px-3.5 py-1.5 text-[13px] text-[var(--success)]"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--danger)]">Gaps</p>
              <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
                {roadmapResponse.roadmap.gaps.map((gap) => (
                  <span
                    key={gap}
                    className="inline-flex whitespace-nowrap rounded-full border border-[rgba(255,114,114,0.18)] bg-[rgba(255,114,114,0.1)] px-3.5 py-1.5 text-[13px] text-[var(--danger)]"
                  >
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.12 }}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="editorial-kicker">Learning graph</p>
              <h2 className="editorial-title mt-3 text-3xl text-[var(--text-primary)] sm:text-4xl">
                Your Learning Path
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                Follow the dependency chain from foundational upgrades to higher-leverage skills. Every node opens into a detailed rationale with resources.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-[rgba(109,183,255,0.18)] bg-[rgba(109,183,255,0.08)] px-3.5 py-1.5 text-sm font-medium text-[var(--accent)]">
              {roadmapResponse.roadmap.roadmap.length} steps
            </span>
          </div>

          <RoadmapGraph items={roadmapResponse.roadmap.roadmap} />
        </motion.section>
      </main>
    </div>
  );
}
