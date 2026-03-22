import { GoogleGenerativeAI } from "@google/generative-ai";
import { slugify, stripCodeBlock } from "@/lib/utils";
import type {
  CurrentLevel,
  GitHubProfileData,
  ResourceLink,
  RoadmapAnalysis,
  RoadmapCategory,
  RoadmapItem,
  RoadmapPriority
} from "@/types";

const GEMINI_MODEL = "gemini-2.5-flash";

const FALLBACK_RESOURCES: Record<RoadmapCategory, ResourceLink[]> = {
  Frontend: [
    { title: "MDN Web Docs", url: "https://developer.mozilla.org/" },
    { title: "Frontend Masters", url: "https://frontendmasters.com/" }
  ],
  Backend: [
    { title: "Node.js Learn", url: "https://nodejs.org/en/learn" },
    {
      title: "System Design Primer",
      url: "https://github.com/donnemartin/system-design-primer"
    }
  ],
  DevOps: [
    { title: "Docker Guides", url: "https://docs.docker.com/guides/" },
    {
      title: "Kubernetes Basics",
      url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/"
    }
  ],
  Testing: [
    { title: "Testing Library Docs", url: "https://testing-library.com/docs/" },
    { title: "Playwright Docs", url: "https://playwright.dev/docs/intro" }
  ],
  Database: [
    {
      title: "PostgreSQL Tutorial",
      url: "https://www.postgresql.org/docs/current/tutorial.html"
    },
    { title: "Prisma Data Guide", url: "https://www.prisma.io/dataguide" }
  ],
  "AI/ML": [
    { title: "Google AI for Developers", url: "https://ai.google.dev/" },
    { title: "Hugging Face Learn", url: "https://huggingface.co/learn" }
  ]
};

function isPlaceholderKey(value: string | undefined) {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length === 0 || normalized === "your_gemini_key" || normalized === "placeholder";
}

function buildPrompt(githubData: GitHubProfileData) {
  return `You are a senior developer career coach. Analyze this GitHub profile data and return ONLY a valid JSON object with no markdown backticks, no explanation, just raw JSON.

GitHub Data: ${JSON.stringify(githubData)}

Return exactly this structure:
{
  "currentLevel": "Beginner|Intermediate|Advanced",
  "primaryStack": ["tech1", "tech2"],
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "roadmap": [
    {
      "id": "unique-id",
      "title": "What to learn",
      "description": "Why this specific person needs this based on their GitHub",
      "priority": "high|medium|low",
      "estimatedTime": "X weeks",
      "category": "Frontend|Backend|DevOps|Testing|Database|AI/ML",
      "resources": [
        { "title": "Resource name", "url": "https://actual-url.com" }
      ],
      "dependsOn": ["id-of-prerequisite-node"]
    }
  ]
}`;
}

function inferLevel(profile: GitHubProfileData): CurrentLevel {
  if (profile.publicRepos >= 24 || profile.contributionCommits >= 1200) {
    return "Advanced";
  }

  if (profile.publicRepos >= 8 || profile.contributionCommits >= 250) {
    return "Intermediate";
  }

  return "Beginner";
}

function normalizeStringArray(input: unknown, fallback: string[]) {
  if (!Array.isArray(input)) {
    return fallback;
  }

  const values = input
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return values.length > 0 ? [...new Set(values)] : fallback;
}

function normalizePriority(input: unknown): RoadmapPriority {
  return input === "high" || input === "medium" || input === "low" ? input : "medium";
}

function normalizeCategory(input: unknown): RoadmapCategory {
  const categories: RoadmapCategory[] = [
    "Frontend",
    "Backend",
    "DevOps",
    "Testing",
    "Database",
    "AI/ML"
  ];

  return categories.includes(input as RoadmapCategory)
    ? (input as RoadmapCategory)
    : "Backend";
}

function normalizeResources(resources: unknown, category: RoadmapCategory) {
  if (!Array.isArray(resources)) {
    return FALLBACK_RESOURCES[category];
  }

  const items = resources
    .map((resource) => {
      if (
        !resource ||
        typeof resource !== "object" ||
        !("title" in resource) ||
        !("url" in resource)
      ) {
        return null;
      }

      const title = typeof resource.title === "string" ? resource.title.trim() : "";
      const url = typeof resource.url === "string" ? resource.url.trim() : "";

      if (!title || !/^https?:\/\//i.test(url)) {
        return null;
      }

      return { title, url };
    })
    .filter((resource): resource is ResourceLink => Boolean(resource));

  return items.length > 0 ? items : FALLBACK_RESOURCES[category];
}

function createFallbackRoadmap(profile: GitHubProfileData) {
  const dominantStack = profile.languageBreakdown.slice(0, 2).map((language) => language.name);
  const fallbackGaps =
    dominantStack.length > 0
      ? [
          "system design fundamentals",
          "testing discipline",
          "deployment automation",
          "performance profiling"
        ]
      : ["full-stack fundamentals", "testing discipline", "deployment automation"];

  return fallbackGaps.slice(0, 4).map<RoadmapItem>((gap, index) => {
    const category: RoadmapCategory =
      index === 0 ? "Backend" : index === 1 ? "Testing" : index === 2 ? "DevOps" : "Frontend";

    return {
      id: `${slugify(gap)}-${index + 1}`,
      title: gap
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      description: `Your public GitHub work shows momentum in ${dominantStack.join(
        " and "
      ) || "your current stack"}, but there is room to deepen ${gap} to ship more complete projects.`,
      priority: index < 2 ? "high" : "medium",
      estimatedTime: index === 0 ? "3 weeks" : "2 weeks",
      category,
      resources: FALLBACK_RESOURCES[category],
      dependsOn: index === 0 ? [] : [`${slugify(fallbackGaps[index - 1])}-${index}`]
    };
  });
}

function createFallbackAnalysis(githubData: GitHubProfileData): RoadmapAnalysis {
  const primaryStack = githubData.languageBreakdown
    .slice(0, 3)
    .map((language) => language.name)
    .filter(Boolean);

  return {
    currentLevel: inferLevel(githubData),
    primaryStack: primaryStack.length > 0 ? primaryStack : ["JavaScript"],
    strengths: [
      githubData.repositories[0]?.primaryLanguage ?? "consistent shipping",
      githubData.pinnedRepositories[0]?.name ?? "visible project work"
    ],
    gaps: ["testing depth", "deployment confidence", "system design breadth"],
    roadmap: createFallbackRoadmap(githubData)
  };
}

function normalizeRoadmapItems(input: unknown, profile: GitHubProfileData) {
  if (!Array.isArray(input)) {
    return createFallbackRoadmap(profile);
  }

  const items = input
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const entry = item as Partial<Record<string, unknown>>;
      const title = typeof entry.title === "string" ? entry.title.trim() : "";
      const description =
        typeof entry.description === "string" ? entry.description.trim() : "";
      const category = normalizeCategory(entry.category);
      const id =
        typeof entry.id === "string" && entry.id.trim().length > 0
          ? entry.id.trim()
          : `${slugify(title || `roadmap-step-${index + 1}`)}-${index + 1}`;
      const estimatedTime =
        typeof entry.estimatedTime === "string" && entry.estimatedTime.trim()
          ? entry.estimatedTime.trim()
          : "2 weeks";

      return {
        id,
        title: title || `Learning step ${index + 1}`,
        description:
          description ||
          `Build a stronger signal in ${category.toLowerCase()} based on your recent GitHub activity.`,
        priority: normalizePriority(entry.priority),
        estimatedTime,
        category,
        resources: normalizeResources(entry.resources, category),
        dependsOn: Array.isArray(entry.dependsOn)
          ? entry.dependsOn.filter((value): value is string => typeof value === "string")
          : []
      } satisfies RoadmapItem;
    })
    .filter((item): item is RoadmapItem => Boolean(item));

  if (items.length === 0) {
    return createFallbackRoadmap(profile);
  }

  const validIds = new Set(items.map((item) => item.id));

  return items.map((item) => ({
    ...item,
    dependsOn: item.dependsOn.filter((dependency) => validIds.has(dependency))
  }));
}

export async function analyzeGitHubProfile(
  githubData: GitHubProfileData
): Promise<RoadmapAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (isPlaceholderKey(apiKey)) {
    return createFallbackAnalysis(githubData);
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8
      }
    });

    const result = await model.generateContent(buildPrompt(githubData));
    const rawText = result.response.text();
    const parsed = JSON.parse(stripCodeBlock(rawText)) as Partial<RoadmapAnalysis>;

    return {
      currentLevel:
        parsed.currentLevel === "Beginner" ||
        parsed.currentLevel === "Intermediate" ||
        parsed.currentLevel === "Advanced"
          ? parsed.currentLevel
          : inferLevel(githubData),
      primaryStack: normalizeStringArray(
        parsed.primaryStack,
        githubData.languageBreakdown.slice(0, 3).map((language) => language.name)
      ),
      strengths: normalizeStringArray(parsed.strengths, [
        githubData.repositories[0]?.primaryLanguage ?? "consistent shipping",
        githubData.pinnedRepositories[0]?.name ?? "visible project work"
      ]),
      gaps: normalizeStringArray(parsed.gaps, [
        "testing depth",
        "deployment confidence",
        "system design breadth"
      ]),
      roadmap: normalizeRoadmapItems(parsed.roadmap, githubData)
    };
  } catch {
    return createFallbackAnalysis(githubData);
  }
}
