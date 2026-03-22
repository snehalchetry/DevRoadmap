"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { sanitizeGitHubUsername } from "@/lib/utils";

const EXAMPLES = ["snehalchetry", "torvalds", "gaearon"];

export function UsernameInput() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitWithUsername(nextUsername: string) {
    const cleanedUsername = sanitizeGitHubUsername(nextUsername);

    if (!cleanedUsername) {
      return;
    }

    startTransition(() => {
      router.push(`/${cleanedUsername}`, { scroll: false });
    });
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitWithUsername(username);
        }}
        className="glass-card-strong mesh-panel relative w-full p-3 shadow-[0_30px_100px_rgba(0,0,0,0.34)]"
        aria-label="Generate a roadmap from a GitHub username"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="github-username" className="sr-only">
            GitHub username
          </label>
          <div className="relative flex-1">
            <input
              id="github-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="off"
              placeholder="Enter GitHub username..."
              className="h-16 w-full rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.05)] px-5 text-base text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:shadow-[0_0_0_4px_var(--accent-glow)]"
            />
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              public github only
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="button-shimmer relative inline-flex h-16 min-w-[220px] items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,#8ac4ff_0%,#6db7ff_44%,#7ef5c5_100%)] px-8 text-[15px] font-semibold text-[#06101e] transition-transform duration-200 hover:scale-[1.015] disabled:cursor-not-allowed disabled:opacity-80"
          >
            <span className="relative z-[1] inline-flex items-center gap-2">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
              <span>{isPending ? "Analyzing Profile" : "Generate Roadmap"}</span>
            </span>
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px] text-[var(--text-muted)]">
        <span>Try:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setUsername(example);
              submitWithUsername(example);
            }}
            className="button-shimmer relative overflow-hidden rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3.5 py-1.5 text-[12px] font-medium transition-colors hover:border-[rgba(109,183,255,0.28)] hover:text-[var(--accent)]"
          >
            <span className="relative z-[1]">{example}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
