import "server-only";
import { type MedlineTopic, searchMedline } from "./medlineplus";
import type { Differential, LearnLink } from "./types";


export async function learnLinksFor(
  differentials: Differential[],
  limit = 3,
): Promise<LearnLink[]> {
  const picks = differentials.slice(0, 4);
  const seenUrls = new Set<string>();
  const links: LearnLink[] = [];

  const results = await Promise.allSettled(
    picks.map((dx) =>
      searchMedline(dx.search_term?.trim() || dx.condition_name, { limit: 3 }),
    ),
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const topic of result.value.topics as MedlineTopic[]) {
      if (links.length >= limit) break;
      if (!topic.url || seenUrls.has(topic.url)) continue;
      seenUrls.add(topic.url);
      links.push({
        title: topic.title,
        url: topic.url,
        snippet: topic.snippet,
        groups: topic.groups,
      });
    }
  }

  return links;
}
