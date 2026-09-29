"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { type JournalEntry, loadJournal, updateEntry } from "@/lib/journal";
import type { LearnLink, RedFlagPayload } from "@/lib/learnTypes";
import type { KenkoResult } from "@/lib/types";
import type { EvaluateResponse } from "../../api/evaluate/route";
import ResultsDisplay from "../../components/ResultsDisplay";

interface Answer {
  id: string;
  question: string;
  answer: string;
}

export default function ResultPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [entry, setEntry] = useState<JournalEntry | null | undefined>(
    undefined,
  );
  const [redFlags, setRedFlags] = useState<RedFlagPayload[]>([]);
  const [learn, setLearn] = useState<LearnLink[]>([]);
  const [questions, setQuestions] = useState<KenkoResult["followup_questions"]>(
    [],
  );
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setEntry(null);
      return;
    }
    const found = loadJournal().find((e) => e.id === id) ?? null;
    setEntry(found);
    setRedFlags(found?.redFlags ?? []);
    setLearn(found?.learn ?? []);
    setQuestions(found?.result?.followup_questions ?? []);
  }, [id]);

  const handleAnswers = useCallback(
    async (answers: Answer[]) => {
      if (!entry) return;
      setIsRefining(true);
      setError(null);
      try {
        const res = await fetch("/api/followup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symptoms: entry.primaryComplaint,
            background: "",
            previous: entry.result,
            answers,
          }),
        });
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload?.error ?? "That did not work. Try again.");
        }
        const next = payload as EvaluateResponse;
        const updated: JournalEntry = {
          ...entry,
          result: next.result,
          label:
            next.result.differential_analysis?.[0]?.condition_name ??
            entry.label,
          conditionName:
            next.result.differential_analysis?.[0]?.condition_name ?? null,
          triageLevel: next.result.triage_level,
          redFlags: next.redFlags,
          learn: next.learn,
        };
        updateEntry(entry.id, updated);
        setEntry(updated);
        setRedFlags(next.redFlags);
        setLearn(next.learn);
        setQuestions([]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsRefining(false);
      }
    },
    [entry],
  );

  if (entry === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <div className="k-card mx-auto max-w-xl px-8 py-16 text-center">
          <p className="text-sm text-body">We could not find that result.</p>
          <Link href="/journal" className="k-btn mt-6 px-8">
            Open my journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mx-auto mt-6 max-w-4xl px-4 sm:px-6">
          <div className="flex items-start justify-between gap-4 rounded-xl border border-danger/20 bg-danger-soft px-5 py-4">
            <p className="text-sm text-danger">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 text-xs font-semibold tracking-wide text-danger/70 uppercase hover:text-danger"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <ResultsDisplay
        result={entry.result}
        redFlags={redFlags}
        learn={learn}
        followupQuestions={questions}
        onAnswerFollowUps={handleAnswers}
        onSkipFollowUps={() => setQuestions([])}
        isRefining={isRefining}
        onPrepareReport={() => router.push(`/report/${id}`)}
        onViewJournal={() => router.push("/journal")}
      />
    </>
  );
}
