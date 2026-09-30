"use client";

import Link from "next/link";
import { useState } from "react";
import { BODY_AREAS } from "@/lib/bodyAreas";
import type { LearnLink } from "@/lib/learnTypes";
import { useLearnQuery } from "@/lib/useLearn";

const AREAS = BODY_AREAS;

function TopicCard({ topic }: { topic: LearnLink }) {
  return (
    <a
      href={topic.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group block rounded-2xl border border-line bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight">
          {topic.title}
        </h3>
        <span
          aria-hidden="true"
          className="mt-0.5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
        >
          ↗
        </span>
      </div>
      {topic.snippet && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
          {topic.snippet}
        </p>
      )}
      <p className="mt-3 text-xs font-medium text-accent-strong">
        Read on MedlinePlus.gov
      </p>
    </a>
  );
}

export default function LearnPage() {
  const [area, setArea] = useState<string>("lungs");
  const [term, setTerm] = useState("");
  const [submitted, setSubmitted] = useState("");

  const areaKey = JSON.stringify({ area, limit: "12" });
  const searchKey = JSON.stringify({ q: submitted, limit: "12" });

  const byArea = useLearnQuery(areaKey, submitted.length === 0);
  const bySearch = useLearnQuery(searchKey, submitted.length > 0);

  const active = submitted.length > 0 ? bySearch : byArea;
  const current = AREAS.find((a) => a.id === area);

  return (
    <div className="animate-in fade-in">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          Learn about a health topic
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body">
          Explanations from the U.S. National Library of Medicine.
          Pick a body part, or search for anything.
        </p>

        {/* Search */}
        <form
          className="mt-8 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(term.trim());
          }}
        >
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. headache, rash, diabetes..."
            aria-label="Search health topics"
            className="k-input flex-1"
          />
          <button type="submit" className="k-btn shrink-0 px-6">
            Search
          </button>
          {submitted.length > 0 && (
            <button
              type="button"
              className="k-btn-ghost shrink-0 px-5"
              onClick={() => {
                setTerm("");
                setSubmitted("");
              }}
            >
              Clear
            </button>
          )}
        </form>

        {/* Body areas */}
        {submitted.length === 0 && (
          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold">Pick a body part</p>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setArea(a.id)}
                  aria-pressed={area === a.id}
                  className={`k-chip ${area === a.id ? "k-chip-on" : "k-chip-off"}`}
                >
                  <span aria-hidden="true">{a.emoji}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mt-8">
          {active.loading && (
            <p className="text-sm text-muted">Loading health topics…</p>
          )}

          {active.error && (
            <div className="rounded-xl border border-danger/20 bg-danger-soft px-5 py-4">
              <p className="text-sm text-danger">{active.error}</p>
            </div>
          )}

          {!active.loading && !active.error && active.topics.length === 0 && (
            <p className="text-sm text-muted">
              Nothing found. Try a different word.
            </p>
          )}

          {!active.loading && active.topics.length > 0 && (
            <>
              <p className="mb-4 text-sm text-body">
                {submitted.length > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold">
                      {active.topics.length}
                    </span>{" "}
                    results for &quot;{submitted}&quot;
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{current?.kidLabel}</span> —{" "}
                    {active.topics.length} topics
                  </>
                )}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {active.topics.map((t) => (
                  <TopicCard key={t.url} topic={t} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-12 rounded-2xl bg-accent px-6 py-8 text-center sm:px-8">
          <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Feeling something today?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/90">
            We can look at your symptoms and tell you what to do next.
          </p>
          <Link
            href="/evaluate"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-accent-strong transition-colors hover:bg-accent-soft"
          >
            Check my symptoms
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
