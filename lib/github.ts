import { graphql } from "@octokit/graphql";
import type {
  GitHubProfileData,
  GitHubRepository,
  LanguageStat,
  PinnedRepository
} from "@/types";

const GITHUB_PROFILE_QUERY = `
  query GitHubProfile($username: String!) {
    user(login: $username) {
      login
      name
      avatarUrl
      bio
      createdAt
      followers {
        totalCount
      }
      repositories(
        ownerAffiliations: OWNER
        privacy: PUBLIC
        first: 20
        orderBy: { field: UPDATED_AT, direction: DESC }
      ) {
        totalCount
        nodes {
          name
          description
          url
          stargazerCount
          forkCount
          updatedAt
          primaryLanguage {
            name
            color
          }
          languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            stargazerCount
            primaryLanguage {
              name
              color
            }
          }
        }
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
        }
      }
    }
  }
`;

type GitHubQueryResponse = {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    createdAt: string;
    followers: {
      totalCount: number;
    };
    repositories: {
      totalCount: number;
      nodes: Array<{
        name: string;
        description: string | null;
        url: string;
        stargazerCount: number;
        forkCount: number;
        updatedAt: string;
        primaryLanguage: {
          name: string;
          color: string | null;
        } | null;
        languages: {
          edges: Array<{
            size: number;
            node: {
              name: string;
              color: string | null;
            };
          }>;
        };
      } | null>;
    };
    pinnedItems: {
      nodes: Array<{
        name: string;
        description: string | null;
        url: string;
        stargazerCount: number;
        primaryLanguage: {
          name: string;
          color: string | null;
        } | null;
      } | null>;
    };
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
      };
    };
  } | null;
};

type RestUserResponse = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  created_at: string;
  followers: number;
  public_repos: number;
};

type RestRepoResponse = {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  languages_url: string;
  language: string | null;
};

type RestEventResponse = Array<{
  type: string;
  payload?: {
    size?: number;
  };
}>;

function isPlaceholderToken(value: string | undefined) {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized === "your_github_pat" ||
    normalized === "placeholder"
  );
}

function getGitHubToken() {
  const token = process.env.GITHUB_TOKEN;
  return isPlaceholderToken(token) ? null : token;
}

function buildGithubClient() {
  const token = getGitHubToken();

  if (!token) {
    return null;
  }

  return graphql.defaults({
    headers: {
      authorization: `token ${token}`
    }
  });
}

function buildGitHubHeaders() {
  const token = getGitHubToken();

  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "DevRoadmap.live",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function sumLanguages(repositories: GitHubRepository[]) {
  const languageMap = new Map<string, LanguageStat>();

  for (const repository of repositories) {
    for (const language of repository.languages) {
      const existing = languageMap.get(language.name);

      if (existing) {
        existing.bytes += language.bytes;
        continue;
      }

      languageMap.set(language.name, { ...language });
    }
  }

  return [...languageMap.values()].sort((left, right) => right.bytes - left.bytes);
}

async function fetchViaGraphQl(username: string): Promise<GitHubProfileData | null> {
  const client = buildGithubClient();

  if (!client) {
    return null;
  }

  const response = await client<GitHubQueryResponse>(GITHUB_PROFILE_QUERY, {
    username
  });

  if (!response.user) {
    return null;
  }

  const repositories: GitHubRepository[] = response.user.repositories.nodes
    .filter((repository): repository is NonNullable<typeof repository> => Boolean(repository))
    .map((repository) => ({
      name: repository.name,
      description: repository.description,
      url: repository.url,
      primaryLanguage: repository.primaryLanguage?.name ?? null,
      stargazerCount: repository.stargazerCount,
      forkCount: repository.forkCount,
      updatedAt: repository.updatedAt,
      languages: repository.languages.edges.map((edge) => ({
        name: edge.node.name,
        color: edge.node.color,
        bytes: edge.size
      }))
    }));

  const pinnedRepositories: PinnedRepository[] = response.user.pinnedItems.nodes
    .filter((repository): repository is NonNullable<typeof repository> => Boolean(repository))
    .map((repository) => ({
      name: repository.name,
      description: repository.description,
      url: repository.url,
      stargazerCount: repository.stargazerCount,
      primaryLanguage: repository.primaryLanguage?.name ?? null
    }));

  return {
    username: response.user.login.toLowerCase(),
    name: response.user.name,
    avatarUrl: response.user.avatarUrl,
    bio: response.user.bio,
    followers: response.user.followers.totalCount,
    createdAt: response.user.createdAt,
    publicRepos: response.user.repositories.totalCount,
    contributionCommits:
      response.user.contributionsCollection.contributionCalendar.totalContributions,
    repositories,
    pinnedRepositories,
    languageBreakdown: sumLanguages(repositories)
  };
}

async function fetchJson<T>(url: string, optional = false) {
  const response = await fetch(url, {
    headers: buildGitHubHeaders(),
    next: { revalidate: 0 }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    if (optional) {
      return null;
    }

    if (response.status === 403 || response.status === 429) {
      throw new Error("GitHub API rate limit reached. Add GITHUB_TOKEN to increase the limit.");
    }

    throw new Error(`GitHub REST request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchViaRest(username: string): Promise<GitHubProfileData | null> {
  const [user, repos, events] = await Promise.all([
    fetchJson<RestUserResponse>(`https://api.github.com/users/${username}`),
    fetchJson<RestRepoResponse[]>(
      `https://api.github.com/users/${username}/repos?per_page=20&sort=updated`
    ),
    fetchJson<RestEventResponse>(
      `https://api.github.com/users/${username}/events/public?per_page=100`,
      true
    )
  ]);

  if (!user || !repos) {
    return null;
  }

  const repositories: GitHubRepository[] = await Promise.all(
    repos.map(async (repository) => {
      const languageMap =
        (await fetchJson<Record<string, number>>(repository.languages_url, true)) ?? {};

      const languages = Object.entries(languageMap)
        .map(([name, bytes]) => ({
          name,
          color: null,
          bytes
        }))
        .sort((left, right) => right.bytes - left.bytes);

      return {
        name: repository.name,
        description: repository.description,
        url: repository.html_url,
        primaryLanguage: repository.language,
        stargazerCount: repository.stargazers_count,
        forkCount: repository.forks_count,
        updatedAt: repository.updated_at,
        languages
      };
    })
  );

  const contributionCommits =
    events?.reduce((total, event) => {
      if (event.type !== "PushEvent") {
        return total;
      }

      return total + (event.payload?.size ?? 0);
    }, 0) ?? 0;

  return {
    username: user.login.toLowerCase(),
    name: user.name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    followers: user.followers,
    createdAt: user.created_at,
    publicRepos: user.public_repos,
    contributionCommits,
    repositories,
    pinnedRepositories: [],
    languageBreakdown: sumLanguages(repositories)
  };
}

export async function fetchGitHubProfile(
  username: string
): Promise<GitHubProfileData | null> {
  try {
    const graphQlProfile = await fetchViaGraphQl(username);

    if (graphQlProfile) {
      return graphQlProfile;
    }
  } catch (error) {
    if (
      error instanceof Error &&
      /Could not resolve to a User|NOT_FOUND/i.test(error.message)
    ) {
      return null;
    }
  }

  return fetchViaRest(username);
}
