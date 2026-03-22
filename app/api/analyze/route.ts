import { NextResponse } from "next/server";
import { analyzeGitHubProfile } from "@/lib/gemini";
import { fetchGitHubProfile } from "@/lib/github";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { isFreshTimestamp, sanitizeGitHubUsername } from "@/lib/utils";
import type { AnalyzeRoadmapRequest, RoadmapApiResponse } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUESTS_PER_DAY = 10;
const CACHE_DAYS = 7;

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error, status }, { status });
}

function getRequestIp(request: Request, fallback?: string) {
  if (fallback) {
    return fallback;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "anonymous";
  }

  return request.headers.get("x-real-ip") ?? "anonymous";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as AnalyzeRoadmapRequest | null;
    const username = sanitizeGitHubUsername(body?.username ?? "");

    if (!username) {
      return errorResponse("A GitHub username is required.", 400);
    }

    const supabaseEnabled = isSupabaseConfigured();
    const ip = getRequestIp(request, body?.ip);
    const today = new Date().toISOString().slice(0, 10);

    if (supabaseEnabled) {
      try {
        const supabase = createServerSupabaseClient();

        const { data: rateLimitRecord, error: rateLimitError } = await supabase
          .from("rate_limits")
          .select("count")
          .eq("ip", ip)
          .eq("date", today)
          .maybeSingle();

        if (!rateLimitError && (rateLimitRecord?.count ?? 0) >= MAX_REQUESTS_PER_DAY) {
          return errorResponse("Rate limit reached for today. Try again tomorrow.", 429);
        }

        const { data: cachedRecord, error: cachedError } = await supabase
          .from("roadmaps")
          .select("username, github_data, roadmap, created_at, updated_at")
          .eq("username", username)
          .maybeSingle();

        if (
          !cachedError &&
          cachedRecord &&
          !body?.force &&
          isFreshTimestamp(cachedRecord.updated_at as string, CACHE_DAYS)
        ) {
          const response: RoadmapApiResponse = {
            cached: true,
            username: cachedRecord.username as string,
            githubData: cachedRecord.github_data as RoadmapApiResponse["githubData"],
            roadmap: cachedRecord.roadmap as RoadmapApiResponse["roadmap"],
            createdAt: cachedRecord.created_at as string,
            updatedAt: cachedRecord.updated_at as string
          };

          return NextResponse.json(response);
        }
      } catch {
        // Fall through and continue without cache/rate-limit support.
      }
    }

    const githubData = await fetchGitHubProfile(username);

    if (!githubData) {
      return errorResponse("GitHub user not found or profile is unavailable.", 404);
    }

    const roadmap = await analyzeGitHubProfile(githubData);
    const timestamp = new Date().toISOString();

    if (supabaseEnabled) {
      try {
        const supabase = createServerSupabaseClient();

        await supabase.from("roadmaps").upsert(
          {
            username,
            github_data: githubData,
            roadmap,
            updated_at: timestamp
          },
          {
            onConflict: "username"
          }
        );

        const { data: existingRateLimit } = await supabase
          .from("rate_limits")
          .select("count")
          .eq("ip", ip)
          .eq("date", today)
          .maybeSingle();

        await supabase.from("rate_limits").upsert(
          {
            ip,
            date: today,
            count: (existingRateLimit?.count ?? 0) + 1
          },
          {
            onConflict: "ip,date"
          }
        );

        const { data: storedRecord } = await supabase
          .from("roadmaps")
          .select("username, github_data, roadmap, created_at, updated_at")
          .eq("username", username)
          .maybeSingle();

        if (storedRecord) {
          const response: RoadmapApiResponse = {
            cached: false,
            username: storedRecord.username as string,
            githubData: storedRecord.github_data as RoadmapApiResponse["githubData"],
            roadmap: storedRecord.roadmap as RoadmapApiResponse["roadmap"],
            createdAt: storedRecord.created_at as string,
            updatedAt: storedRecord.updated_at as string
          };

          return NextResponse.json(response);
        }
      } catch {
        // Continue and return an uncached analysis response.
      }
    }

    const response: RoadmapApiResponse = {
      cached: false,
      username,
      githubData,
      roadmap,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while analyzing GitHub data.";

    if (/rate limit/i.test(message)) {
      return errorResponse(message, 429);
    }

    return errorResponse(message, 500);
  }
}
