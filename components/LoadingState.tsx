"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Orbit, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  username: string;
  avatarUrl?: string;
  className?: string;
  overlay?: boolean;
  progress?: number;
  status?: string;
}

export function LoadingState({
  username,
  avatarUrl,
  className,
  overlay = false,
  progress,
  status
}: LoadingStateProps) {
  const steps = useMemo(
    () => [
      "Fetching GitHub profile...",
      "Mapping contribution velocity...",
      "Analyzing language signatures...",
      "Finding architectural blind spots...",
      "Generating your learning graph..."
    ],
    []
  );

  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (status) {
      return;
    }

    const interval = window.setInterval(() => {
      setStepIndex((currentIndex) => (currentIndex + 1) % steps.length);
    }, 1350);

    return () => {
      window.clearInterval(interval);
    };
  }, [steps]);

  const activeStatus = status ?? steps[stepIndex];
  const safeProgress = Math.max(0, Math.min(progress ?? 8, 100));

  return (
    <div
      className={cn(
        overlay
          ? "fixed inset-0 z-[120] flex items-center justify-center bg-[#050811]/94 px-6 backdrop-blur-2xl"
          : "flex min-h-screen items-center justify-center bg-[#050811] px-6",
        className
      )}
    >
      <div className="glass-card-strong mesh-panel relative w-full max-w-[620px] overflow-hidden p-8 text-center sm:p-10">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[rgba(109,183,255,0.2)] bg-[rgba(109,183,255,0.08)] px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
          <Sparkles className="h-3.5 w-3.5" />
          Rendering Dev Trajectory
        </div>

        <div className="relative mx-auto mt-10 h-28 w-28">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-[rgba(109,183,255,0.18)]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[8px] rounded-full border border-dashed border-[rgba(126,245,197,0.18)]"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[16px] rounded-full bg-[radial-gradient(circle,rgba(109,183,255,0.28),rgba(109,183,255,0.06))] blur-[2px]"
          />
          <div className="absolute inset-[18px] flex items-center justify-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] shadow-[0_0_45px_rgba(109,183,255,0.18)]">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={username}
                className="h-full w-full object-cover"
              />
            ) : (
              <Orbit className="h-8 w-8 text-[var(--accent)]" />
            )}
          </div>
        </div>

        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
          analyzing @{username}
        </p>
        <h2 className="editorial-title mt-3 text-3xl text-[var(--text-primary)] sm:text-4xl">
          Building your roadmap.
        </h2>

        <div className="mt-8 h-10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeStatus}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="text-base text-[var(--text-secondary)]"
            >
              {activeStatus}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-8 overflow-hidden rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] p-1">
          <motion.div
            className="h-2 rounded-full bg-[linear-gradient(90deg,#6db7ff_0%,#7ef5c5_56%,#ff9d6c_100%)] shadow-[0_0_20px_rgba(109,183,255,0.4)]"
            initial={false}
            animate={{ width: `${safeProgress}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {Math.round(safeProgress)}% complete
        </p>
      </div>
    </div>
  );
}
