"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, ExternalLink, Sparkles, X } from "lucide-react";
import { CATEGORY_COLORS, PRIORITY_STYLES, type RoadmapItem } from "@/types";

interface SideDrawerProps {
  open: boolean;
  skill: RoadmapItem | null;
  onOpenChange: (open: boolean) => void;
}

export function SideDrawer({ open, skill, onOpenChange }: SideDrawerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mediaQuery.matches);

    update();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  const categoryColor = skill ? CATEGORY_COLORS[skill.category] : "#6db7ff";
  const priorityStyle = skill ? PRIORITY_STYLES[skill.priority] : PRIORITY_STYLES.medium;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && skill ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-0 z-[99] bg-[rgba(3,6,14,0.76)] backdrop-blur-md"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild onOpenAutoFocus={(event) => event.preventDefault()}>
              <motion.aside
                initial={isMobile ? { y: "100%" } : { x: 420 }}
                animate={isMobile ? { y: 0 } : { x: 0 }}
                exit={isMobile ? { y: "100%" } : { x: 420 }}
                transition={{ type: "spring", stiffness: 270, damping: 30 }}
                className={
                  isMobile
                    ? "fixed inset-x-0 bottom-0 z-[100] h-[74vh] rounded-t-[28px] border border-b-0 border-[var(--border)] bg-[rgba(7,10,22,0.94)] p-6 shadow-[0_-40px_100px_rgba(0,0,0,0.45)]"
                    : "fixed right-0 top-0 z-[100] h-screen w-full max-w-[420px] border-l border-[var(--border)] bg-[rgba(7,10,22,0.94)] p-7 shadow-[-40px_0_100px_rgba(0,0,0,0.4)]"
                }
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold"
                        style={{
                          background: `${categoryColor}18`,
                          borderColor: `${categoryColor}40`,
                          color: categoryColor
                        }}
                      >
                        {skill.category}
                      </span>
                      <span
                        className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold"
                        style={{
                          background: priorityStyle.background,
                          borderColor: priorityStyle.border,
                          color: priorityStyle.text
                        }}
                      >
                        {priorityStyle.label} priority
                      </span>
                    </div>

                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Close skill details"
                        className="button-shimmer relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                      >
                        <span className="relative z-[1]">
                          <X className="h-4 w-4" />
                        </span>
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="mt-6 flex-1 overflow-y-auto pr-1">
                    <div className="glass-card p-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(109,183,255,0.18)] bg-[rgba(109,183,255,0.08)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Why this matters
                      </div>
                      <Dialog.Title className="editorial-title mt-4 text-2xl text-[var(--text-primary)]">
                        {skill.title}
                      </Dialog.Title>
                      <Dialog.Description className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                        {skill.description}
                      </Dialog.Description>
                    </div>

                    <div className="mt-4 glass-card p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(109,183,255,0.16)] bg-[rgba(109,183,255,0.08)]">
                          <Clock className="h-4 w-4 text-[var(--accent)]" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Estimated time
                          </p>
                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                            {skill.estimatedTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Resources
                      </p>
                      <div className="mt-3 space-y-2">
                        {skill.resources.map((resource) => (
                          <a
                            key={`${skill.id}-${resource.url}`}
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="glass-card group flex items-center justify-between px-4 py-3 text-sm text-[var(--text-secondary)] transition-all hover:border-[rgba(109,183,255,0.2)] hover:text-[var(--accent)]"
                          >
                            <span className="pr-4">{resource.title}</span>
                            <ExternalLink className="h-4 w-4 shrink-0 text-[var(--accent)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
