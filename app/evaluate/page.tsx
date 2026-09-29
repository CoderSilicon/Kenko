"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  extractImages,
  type JournalEntry,
  parseBaseline,
  saveEntry,
  uid,
} from "@/lib/journal";
import type { EvaluateResponse } from "../api/evaluate/route";
import KenkoWizard from "../components/KenkoWizard";

export default function EvaluatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEvaluate(formData: FormData) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        body: formData,
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(
          payload?.error ?? "Something went wrong. Please try again.",
        );
      }

      const { result, redFlags = [], learn = [] } = payload as EvaluateResponse;

      const symptoms = (formData.get("symptoms") as string) ?? "";
      const images = await extractImages(formData);

      const entry: JournalEntry = {
        id: uid(),
        createdAt: Date.now(),
        label:
          result.differential_analysis?.[0]?.condition_name ??
          result.user_hypothesis_analysis?.user_suspected_condition ??
          "My check-in",
        primaryComplaint: symptoms,
        baselineSeverity: parseBaseline(symptoms),
        conditionName:
          result.differential_analysis?.[0]?.condition_name ?? null,
        triageLevel: result.triage_level,
        result,
        redFlags,
        learn,
        images,
        checkIns: [],
      };

      saveEntry(entry);
      router.push(`/result/${entry.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="animate-in fade-in">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm link"
          >
            <span aria-hidden="true">←</span>
            Home
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Tell us what is going on
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-body">
            One question at a time. If you are not sure, just skip it.
          </p>
        </div>

        <div className="k-card p-5 sm:p-8">
          <KenkoWizard onComplete={handleEvaluate} isLoading={isLoading} />
          {error && (
            <div className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-danger/20 bg-danger-soft px-5 py-4">
              <p className="text-sm text-danger">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="shrink-0 text-xs font-semibold tracking-wide text-danger/70 uppercase hover:text-danger"
              >
                Close
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted">
          If something feels dangerous, do not wait for an answer. Call your
          local emergency number now.
        </p>
      </div>
    </div>
  );
}
