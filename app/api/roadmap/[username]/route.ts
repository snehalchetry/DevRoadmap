import { NextResponse } from "next/server";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { isFreshTimestamp, sanitizeGitHubUsername } from "@/lib/utils";
import type { RoadmapApiResponse } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_DAYS = 7;

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error, status }, { status });
}

export async function GET(
  _request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const username = sanitizeGitHubUsername(params.username);

    if (!username) {
      return errorResponse("A valid GitHub username is required.", 400);
    }

    if (!isSupabaseConfigured()) {
      return errorResponse("No cached roadmap found for this username.", 404);
    }

    try {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase
        .from("roadmaps")
        .select("username, github_data, roadmap, created_at, updated_at")
        .eq("username", username)
        .maybeSingle();

      if (error) {
        return errorResponse("No cached roadmap found for this username.", 404);
      }

      if (!data || !isFreshTimestamp(data.updated_at as string, CACHE_DAYS)) {
        return errorResponse("No cached roadmap found for this username.", 404);
      }

      const response: RoadmapApiResponse = {
        cached: true,
        username: data.username as string,
        githubData: data.github_data as RoadmapApiResponse["githubData"],
        roadmap: data.roadmap as RoadmapApiResponse["roadmap"],
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string
      };

      return NextResponse.json(response);
    } catch {
      return errorResponse("No cached roadmap found for this username.", 404);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while fetching roadmap.";

    return errorResponse(message, 500);
  }
}
