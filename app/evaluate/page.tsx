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
import type { KenkoResult } from "@/lib/types";
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

      if (!res.ok) {
        let message = "Evaluation failed.";
        try {
          const errData = await res.json();
          message = errData.error || message;
        } catch {
          /* keep default message */
        }
        throw new Error(message);
      }

      const data: KenkoResult = await res.json();
      const symptoms = (formData.get("symptoms") as string) ?? "";

      const images = await extractImages(formData);
      const entry: JournalEntry = {
        id: uid(),
        createdAt: Date.now(),
        label:
          data.differential_analysis[0]?.condition_name ??
          data.user_hypothesis_analysis?.user_suspected_condition ??
          "New evaluation",
        primaryComplaint: symptoms,
        baselineSeverity: parseBaseline(symptoms),
        conditionName: data.differential_analysis[0]?.condition_name ?? null,
        triageLevel: data.triage_level,
        result: data,
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
            className="inline-flex items-center gap-1.5 rounded-full text-sm link"
          >
            <span aria-hidden="true">←</span>
            Back home
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Tell us what&apos;s going on
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-body">
            One question at a time — skip anything you&apos;re unsure about.
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
                className="shrink-0 text-xs font-semibold tracking-wide text-danger/70 uppercase transition-colors hover:text-danger"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
