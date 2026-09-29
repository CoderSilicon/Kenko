"use client";

import { useCallback, useEffect, useState } from "react";
import type { LearnLink, MedlineResultShape } from "./learnTypes";

export function useLearnSearch() {
  const [topics, setTopics] = useState<LearnLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (params: Record<string, string>, signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams(params).toString();
        const res = await fetch(`/api/learn?${qs}`, { signal });
        const data = (await res.json()) as MedlineResultShape;
        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          setTopics([]);
          return null;
        }
        setTopics(data.topics ?? []);
        return data;
      } catch (err) {
        if ((err as Error).name === "AbortError") return null;
        setError("We could not reach the health library. Please try again.");
        setTopics([]);
        return null;
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [],
  );

  return { topics, setTopics, loading, error, setError, run };
}

/**
 * Runs one search and keeps it in step with `key`.
 * `key` is a plain string so callers can pass a stable serialised query.
 */
export function useLearnQuery(key: string, enabled = true) {
  const { topics, setTopics, loading, error, setError, run } = useLearnSearch();

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    run(JSON.parse(key) as Record<string, string>, controller.signal);
    return () => controller.abort();
  }, [key, enabled, run]);

  return {
    topics,
    setTopics,
    loading,
    error,
    setError,
    refresh: () => run(JSON.parse(key) as Record<string, string>),
  };
}
