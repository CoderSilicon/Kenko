"use client";

import { useState } from "react";
import KenkoForm from "./components/KenkoForm";
import ResultsDisplay from "./components/ResultsDisplay";

interface KenkoResult {
  is_emergency: boolean;
  emergency_warning: string | null;
  kenko_eval_summary: string;
  user_hypothesis_analysis: {
    user_suspected_condition: string;
    verdict: string;
    clinical_reasoning: string;
  };
  differential_analysis: Array<{
    condition_name: string;
    likelihood: string;
    matching_indicators: string[];
    differentiating_indicators: string[];
    clinical_overview: string;
  }>;
  triage_level: string;
  recommended_actions: string[];
  physician_consult_guide: string[];
}

export default function Home() {
  const [result, setResult] = useState<KenkoResult | null>(null);
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
        const errData = await res.json();
        throw new Error(errData.error || "Evaluation failed.");
      }

      const data: KenkoResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="w-full border-b border-[#e8e4df]">
        <div className="flex items-center justify-between px-8 py-5 md:px-16">
          <span className="text-sm font-medium tracking-[0.2em] text-[#2c2c2c]">
            KENKO
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {!result ? (
          <div className="w-full animate-in fade-in duration-500">
            {/* Hero */}
            <div className="w-full bg-[#f0ece6] px-8 py-20 md:px-16 md:py-28">
              <div className="w-full">
                <h1 className="text-3xl font-light tracking-tight text-[#2c2c2c] md:text-4xl">
                  Tell us what problem, you're facing?
                </h1>
                <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-[#8a8278]">
                  Describe your symptoms and receive a structured clinical
                  differential analysis.
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="w-full px-8 py-12 md:px-16 md:py-16">
              <div className="w-full">
                <KenkoForm onEvaluate={handleEvaluate} isLoading={isLoading} />
              </div>
            </div>

            {error && (
              <div className="w-full px-8 md:px-16">
                <div className="w-full border border-[#d4c8bc] bg-[#f5f0eb] px-6 py-5 text-sm text-[#8b4a3a]">
                  {error}
                </div>
              </div>
            )}
          </div>
        ) : (
          <ResultsDisplay result={result} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#e8e4df] bg-[#f5f0eb]">
        <div className="px-8 py-8 md:px-16">
          <div className="w-full">
            <p className="text-[11px] font-light leading-loose text-[#a09890]">
              <span className="font-normal text-[#8a8278]">
                Medical Disclaimer:
              </span>{" "}
              Kenko is an AI-powered tool. It does not diagnose, treat, or
              replace professional medical advice. Outputs may contain
              inaccuracies. Always consult a licensed healthcare provider to
              confirm any evaluation before making health decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
