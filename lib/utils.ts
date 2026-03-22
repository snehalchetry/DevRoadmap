import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeGitHubUsername(username: string) {
  return username.trim().replace(/^@/, "").toLowerCase();
}

export function stripCodeBlock(input: string) {
  return input
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isFreshTimestamp(timestamp: string, maxAgeDays: number) {
  const age = Date.now() - new Date(timestamp).getTime();
  return age < maxAgeDays * 24 * 60 * 60 * 1000;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatGitHubSince(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric"
  });
}

export function formatRelativeTime(date: string, now = Date.now()) {
  const timestamp = new Date(date).getTime();
  const diffMs = Math.max(now - timestamp, 0);
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) {
    return "Generated just now";
  }

  if (minutes < 60) {
    return `Generated ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (hours < 24) {
    return `Generated ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  return `Generated ${days} day${days === 1 ? "" : "s"} ago`;
}

export function getTopLanguage(languages: { name: string }[]) {
  return languages[0]?.name ?? "Unknown";
}
