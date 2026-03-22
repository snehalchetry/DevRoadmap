import type { Node } from "reactflow";

export type CurrentLevel = "Beginner" | "Intermediate" | "Advanced";
export type RoadmapPriority = "high" | "medium" | "low";
export type RoadmapCategory =
  | "Frontend"
  | "Backend"
  | "DevOps"
  | "Testing"
  | "Database"
  | "AI/ML";

export interface ResourceLink {
  title: string;
  url: string;
}

export interface LanguageStat {
  name: string;
  color: string | null;
  bytes: number;
}

export interface GitHubRepository {
  name: string;
  description: string | null;
  url: string;
  primaryLanguage: string | null;
  stargazerCount: number;
  forkCount: number;
  updatedAt: string;
  languages: LanguageStat[];
}

export interface PinnedRepository {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  primaryLanguage: string | null;
}

export interface GitHubProfileData {
  username: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  followers: number;
  createdAt: string;
  publicRepos: number;
  contributionCommits: number;
  repositories: GitHubRepository[];
  pinnedRepositories: PinnedRepository[];
  languageBreakdown: LanguageStat[];
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  priority: RoadmapPriority;
  estimatedTime: string;
  category: RoadmapCategory;
  resources: ResourceLink[];
  dependsOn: string[];
}

export interface RoadmapAnalysis {
  currentLevel: CurrentLevel;
  primaryStack: string[];
  strengths: string[];
  gaps: string[];
  roadmap: RoadmapItem[];
}

export interface StoredRoadmapRecord {
  username: string;
  githubData: GitHubProfileData;
  roadmap: RoadmapAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyzeRoadmapRequest {
  username: string;
  ip?: string;
  force?: boolean;
}

export interface RoadmapApiResponse extends StoredRoadmapRecord {
  cached: boolean;
}

export interface ApiErrorResponse {
  error: string;
  status: number;
}

export interface SkillNodeData extends RoadmapItem {
  onSelect?: (item: RoadmapItem) => void;
  isSelected?: boolean;
}

export type SkillNode = Node<SkillNodeData>;

export const CATEGORY_COLORS: Record<RoadmapCategory, string> = {
  Frontend: "#AFA9EC",
  Backend: "#5DCAA5",
  DevOps: "#58A6FF",
  Testing: "#FAC775",
  Database: "#F5C4B3",
  "AI/ML": "#ED93B1"
};

export const LEVEL_STYLES: Record<
  CurrentLevel,
  {
    background: string;
    text: string;
  }
> = {
  Beginner: {
    background: "#F0883E",
    text: "#0d1117"
  },
  Intermediate: {
    background: "#58A6FF",
    text: "#0d1117"
  },
  Advanced: {
    background: "#3FB950",
    text: "#0d1117"
  }
};

export const PRIORITY_STYLES: Record<
  RoadmapPriority,
  {
    background: string;
    border: string;
    text: string;
    label: string;
  }
> = {
  high: {
    background: "rgba(248,81,73,0.15)",
    border: "rgba(248,81,73,0.3)",
    text: "#F85149",
    label: "High"
  },
  medium: {
    background: "rgba(240,136,62,0.15)",
    border: "rgba(240,136,62,0.3)",
    text: "#F0883E",
    label: "Medium"
  },
  low: {
    background: "rgba(139,148,158,0.15)",
    border: "rgba(139,148,158,0.3)",
    text: "#8B949E",
    label: "Low"
  }
};
