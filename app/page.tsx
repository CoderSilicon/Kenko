"use client";

import { useEffect, useState } from "react";
import {
  addCheckIn,
  type CheckIn,
  extractImages,
  type JournalEntry,
  loadJournal,
  parseBaseline,
  removeEntry,
  saveEntry,
  uid,
} from "@/lib/journal";
import type { KenkoResult } from "@/lib/types";
import DoctorReport from "./components/DoctorReport";
import JournalView from "./components/JournalView";
import KenkoWizard from "./components/KenkoWizard";
import ResultsDisplay from "./components/ResultsDisplay";

type Stage = "intro" | "wizard" | "result" | "journal" | "report";

const FEATURES = [
  {
    icon: "01",
    title: "Guided questions",
    desc: "Describe how you feel in plain words, one focused step at a time.",
  },
  {
    icon: "02",
    title: "Photo scanning",
    desc: "Add a clear photo of a rash, skin issue, or throat for visual review.",
  },
  {
    icon: "03",
    title: "Your guess, tested",
    desc: "We tell you honestly whether your own theory makes sense or not.",
  },
  {
    icon: "04",
    title: "Tracks over time",
    desc: "Check in daily to see how your symptoms and severity trend.",
  },
];

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [result, setResult] = useState<KenkoResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJournal(loadJournal());
  }, []);

  const activeEntry = journal.find((e) => e.id === activeEntryId) ?? null;

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

      const nextJournal = saveEntry(entry);
      setJournal(nextJournal);
      setActiveEntryId(entry.id);
      setResult(data);
      setStage("result");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleCheckIn(id: string, checkIn: CheckIn) {
    setJournal(addCheckIn(id, checkIn));
  }

  function handleDelete(id: string) {
    setJournal(removeEntry(id));
    if (id === activeEntryId) {
      setActiveEntryId(null);
      setResult(null);
      setStage("journal");
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setActiveEntryId(null);
    setStage("intro");
  }

  function goTo(where: Stage) {
    setError(null);
    setStage(where);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="no-print w-full border-b border-[#e8e4df] bg-[#faf8f5]">
        <div className="flex items-center justify-between px-6 py-5 md:px-16">
          <button
            type="button"
            onClick={() => goTo("intro")}
            className="text-sm font-semibold tracking-[0.25em] text-[#2c2c2c] uppercase transition-opacity hover:opacity-60"
          >
            Kenko
          </button>
          <nav className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => goTo("journal")}
              className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.25em] text-[#8a8278] uppercase transition-colors hover:text-[#2c2c2c]"
            >
              Journal
              {journal.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2c2c2c] px-1 text-[9px] font-semibold text-[#faf8f5]">
                  {journal.length}
                </span>
              )}
            </button>
            <span className="hidden text-[10px] font-light tracking-[0.3em] text-[#a09890] uppercase md:inline">
              AI Health Evaluation
            </span>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {stage === "intro" && (
          <div className="w-full animate-in fade-in duration-500">
            {/* Hero */}
            <div className="w-full border-b border-[#e8e4df] bg-gradient-to-b from-[#f0ece6] to-[#faf8f5] px-6 py-20 md:px-16 md:py-28">
              <div className="max-w-3xl">
                <p className="mb-6 inline-flex items-center gap-3 text-[10px] font-medium tracking-[0.3em] text-[#8a8278] uppercase">
                  <span className="h-px w-10 bg-[#8a8278]" />
                  Turn uncertainty into clarity
                </p>
                <h1 className="text-4xl font-light tracking-tight text-[#2c2c2c] md:text-6xl">
                  Understand what your
                  <span className="italic"> symptoms </span>
                  are telling you.
                </h1>
                <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-[#8a8278]">
                  Kenko walks you through a few focused questions, reviews any
                  photos you add, and checks your own guess against medical
                  knowledge — so you know what might be going on and what to do
                  next.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => goTo("wizard")}
                    className="group inline-flex items-center justify-center gap-3 border border-[#2c2c2c] bg-[#2c2c2c] px-10 py-4 text-xs font-semibold tracking-[0.25em] text-[#faf8f5] uppercase transition-all hover:bg-[#3d3d3d]"
                  >
                    Start Evaluation
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                  <p className="text-[11px] font-light text-[#a09890]">
                    About 2 minutes · No sign-up needed · Saved to your journal
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="w-full px-6 py-16 md:px-16 md:py-20">
              <div className="mb-10 flex items-center gap-3">
                <span className="h-px w-8 bg-[#d4c8bc]" />
                <p className="text-[10px] font-medium tracking-[0.3em] text-[#b8b0a6] uppercase">
                  What to expect
                </p>
              </div>
              <div className="grid gap-px overflow-hidden border border-[#e8e4df] bg-[#e8e4df] sm:grid-cols-2 md:grid-cols-4">
                {FEATURES.map((f) => (
                  <div
                    key={f.icon}
                    className="bg-[#faf8f5] p-8 transition-colors hover:bg-[#f0ece6]"
                  >
                    <p className="text-[10px] font-medium tracking-[0.2em] text-[#b8b0a6]">
                      {f.icon}
                    </p>
                    <h3 className="mt-4 text-sm font-medium text-[#2c2c2c]">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-[#8a8278]">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {stage === "wizard" && (
          <div className="w-full animate-in fade-in duration-500">
            <div className="w-full px-6 py-12 md:px-16 md:py-20">
              <div className="max-w-2xl">
                <div className="mb-10">
                  <p className="mb-3 flex items-center gap-3 text-[10px] font-medium tracking-[0.3em] text-[#8a8278] uppercase">
                    <button
                      type="button"
                      onClick={() => goTo("intro")}
                      className="inline-flex items-center gap-2 transition-colors hover:text-[#2c2c2c]"
                    >
                      <span>←</span>
                      Back to start
                    </button>
                  </p>
                  <h1 className="text-2xl font-light tracking-tight text-[#2c2c2c] md:text-3xl">
                    Tell us what&apos;s going on
                  </h1>
                  <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-[#8a8278]">
                    A few short questions, one at a time. Anything you&apos;re
                    not sure about can be skipped.
                  </p>
                </div>
                <KenkoWizard
                  onComplete={handleEvaluate}
                  isLoading={isLoading}
                />
                {error && (
                  <div className="mt-8 flex items-center justify-between gap-4 border border-[#d4c8bc] bg-[#f5f0eb] px-6 py-5">
                    <p className="text-sm text-[#8b4a3a]">{error}</p>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="shrink-0 text-xs font-medium tracking-wider text-[#8a8278] uppercase transition-colors hover:text-[#2c2c2c]"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {stage === "result" && result && (
          <ResultsDisplay
            result={result}
            onReset={handleReset}
            onPrepareReport={() =>
              activeEntryId ? goTo("report") : goTo("journal")
            }
            onViewJournal={() => goTo("journal")}
          />
        )}

        {stage === "journal" && (
          <div className="w-full px-6 py-12 md:px-16 md:py-20">
            <div className="mx-auto max-w-3xl">
              <JournalView
                entries={journal}
                onStart={() => goTo("wizard")}
                onOpenReport={(id) => {
                  setActiveEntryId(id);
                  goTo("report");
                }}
                onCheckIn={handleCheckIn}
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}

        {stage === "report" &&
          (activeEntry ? (
            <DoctorReport entry={activeEntry} onBack={() => goTo("journal")} />
          ) : (
            <JournalView
              entries={journal}
              onStart={() => goTo("wizard")}
              onOpenReport={(id) => {
                setActiveEntryId(id);
                goTo("report");
              }}
              onCheckIn={handleCheckIn}
              onDelete={handleDelete}
            />
          ))}
      </main>

      {/* Footer */}
      <footer className="no-print w-full border-t border-[#e8e4df] bg-[#f5f0eb]">
        <div className="px-6 py-8 md:px-16">
          <div className="mx-auto max-w-4xl">
            <p className="text-[11px] font-light leading-loose text-[#a09890]">
              <span className="font-normal text-[#8a8278]">
                Medical Disclaimer:
              </span>{" "}
              Kenko is an AI-powered educational tool. It does not diagnose,
              treat, or replace professional medical advice. Outputs may contain
              inaccuracies. Always consult a licensed healthcare provider to
              confirm any evaluation before making health decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
