"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  className?: string;
}

export function ShareButton({ className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "button-shimmer relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[rgba(109,183,255,0.24)]",
        className
      )}
      aria-label={copied ? "Roadmap link copied" : "Copy roadmap link"}
    >
      <span className="relative z-[1] inline-flex items-center gap-2">
        {copied ? (
          <Check className="h-4 w-4 text-[var(--success)]" />
        ) : (
          <Share2 className="h-4 w-4 text-[var(--accent)]" />
        )}
        <span>{copied ? "Copied" : "Share"}</span>
        {!copied ? <Copy className="h-3.5 w-3.5 text-[var(--text-muted)]" /> : null}
      </span>
    </button>
  );
}
