import "server-only";
import { cacheGet, cacheSet } from "./db";

/**
 * MedlinePlus Web service client.
 * Docs: https://wsearch.nlm.nih.gov/ws/query (see info.txt in the repo root)
 *
 * Rules we follow from the NLM acceptable-use policy:
 *  - never more than 85 requests per minute (we cap well below that)
 *  - cache every response for 24 hours
 *  - always send `tool` so NLM can reach us
 */

export const MEDLINEPLUS_BASE = "https://wsearch.nlm.nih.gov/ws/query";
const TOOL = "kenko";
const MAX_PER_MINUTE = 60;
const MAX_PER_SEARCH = 20;

export type Language = "en" | "es";

export interface MedlineTopic {
  title: string;
  url: string;
  snippet: string;
  groups: string[];
  alsoCalled: string[];
}

export interface MedlineResult {
  query: string;
  count: number;
  topics: MedlineTopic[];
  source: "cache" | "network";
}

/* ── Rate limiter: simple sliding window ─────────────────────────── */

const hits: number[] = [];

function throttle(): Promise<void> {
  const now = Date.now();
  while (hits.length > 0 && now - hits[0] > 60_000) hits.shift();
  if (hits.length < MAX_PER_MINUTE) {
    hits.push(now);
    return Promise.resolve();
  }
  const waitMs = 60_000 - (now - hits[0]) + 50;
  return new Promise((resolve) => setTimeout(resolve, waitMs));
}

/* ── XML helpers ─────────────────────────────────────────────────── */

function decodeEntities(input: string): string {
  return input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&amp;/g, "&");
}

/** Removes the keyword-highlight tags MedlinePlus wraps around matched terms. */
function stripHighlights(input: string): string {
  return input.replace(/<\/?span[^>]*>/gi, "");
}

/** Decode first, then drop the highlight tags that the entities were hiding. */
function cleanText(raw: string): string {
  return stripHighlights(decodeEntities(raw))
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Reads the text of a top level element such as <count>55</count>. */
function tagText(fragment: string, tag: string): string {
  const match = fragment.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? match[1] : "";
}

/** Reads every `<content name="X">value</content>` inside a fragment. */
function contentValues(fragment: string, name: string): string[] {
  const re = new RegExp(
    `<content\\s+name="${name}"\\s*>([\\s\\S]*?)</content>`,
    "g",
  );
  const out: string[] = [];
  let m = re.exec(fragment);
  while (m) {
    out.push(m[1]);
    m = re.exec(fragment);
  }
  return out;
}

function firstContent(fragment: string, name: string): string {
  return contentValues(fragment, name)[0] ?? "";
}

function parseDocuments(xml: string): {
  count: number;
  topics: MedlineTopic[];
} {
  const count = Number(
    firstContent(xml, "count") || tagText(xml, "count") || "0",
  );
  const listMatch = xml.match(/<list\b[^>]*>([\s\S]*?)<\/list>/);
  if (!listMatch) return { count, topics: [] };

  const docs: MedlineTopic[] = [];
  const docRe = /<document\b([^>]*)>([\s\S]*?)<\/document>/g;
  let m = docRe.exec(listMatch[1]);
  while (m) {
    const body = m[2];
    const urlMatch = m[1].match(/url="([^"]*)"/);
    const title = cleanText(firstContent(body, "title"));

    docs.push({
      title: title || "Untitled topic",
      url: urlMatch ? decodeEntities(urlMatch[1]) : "",
      snippet: cleanText(firstContent(body, "snippet")),
      groups: contentValues(body, "groupName").map(cleanText).filter(Boolean),
      alsoCalled: contentValues(body, "altTitle")
        .map(cleanText)
        .filter(Boolean),
    });
    m = docRe.exec(listMatch[1]);
  }

  return { count, topics: docs };
}

/* ── Public API ──────────────────────────────────────────────────── */

function buildUrl(term: string, language: Language, limit: number): string {
  const params = new URLSearchParams({
    db: language === "es" ? "healthTopicsSpanish" : "healthTopics",
    term,
    rettype: "brief",
    retmax: String(limit),
    tool: TOOL,
  });
  return `${MEDLINEPLUS_BASE}?${params.toString()}`;
}

export async function searchMedline(
  term: string,
  options: { language?: Language; limit?: number } = {},
): Promise<MedlineResult> {
  const language = options.language ?? "en";
  const limit = Math.min(Math.max(options.limit ?? 5, 1), MAX_PER_SEARCH);
  const query = term.trim();
  if (!query) return { query: "", count: 0, topics: [], source: "cache" };

  const key = `medline:${language}:${limit}:${query.toLowerCase()}`;
  const cached = cacheGet(key);
  if (cached) {
    const parsed = JSON.parse(cached) as Omit<MedlineResult, "source">;
    return { ...parsed, source: "cache" };
  }

  await throttle();
  const res = await fetch(buildUrl(query, language, limit), {
    headers: { Accept: "application/xml" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    throw new Error(`MedlinePlus responded with ${res.status}`);
  }

  const { count, topics } = parseDocuments(await res.text());
  const payload = { query, count, topics };
  cacheSet(key, JSON.stringify(payload));
  return { ...payload, source: "network" };
}

/** Lists the health topics filed under one MedlinePlus group (body system). */
export async function topicsInGroup(
  group: string,
  options: { language?: Language; limit?: number } = {},
): Promise<MedlineResult> {
  return searchMedline(`group:"${group}"`, options);
}
