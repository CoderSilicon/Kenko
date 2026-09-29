"use client";

import { useState } from "react";
import type { FollowUpQuestion } from "@/lib/types";

/**
 * The short extra questions. Answers are handed back to the parent, which
 * sends them to /api/followup to sharpen the result.
 */
export default function FollowUpQuestions({
  questions,
  onSubmit,
  onCancel,
  isLoading,
}: {
  questions: FollowUpQuestion[];
  onSubmit: (
    answers: Array<{ id: string; question: string; answer: string }>,
  ) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [free, setFree] = useState<Record<string, string>>({});
  const [showAll, setShowAll] = useState(false);

  if (questions.length === 0) return null;

  const answered = questions.filter((q) => answers[q.id]?.trim()).length;
  const allAnswered = answered === questions.length;

  function pick(q: FollowUpQuestion, choice: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: choice }));
    setFree((prev) => ({ ...prev, [q.id]: "" }));
  }

  function type(q: FollowUpQuestion, value: string) {
    setFree((prev) => ({ ...prev, [q.id]: value }));
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  }

  function submit() {
    onSubmit(
      questions.map((q) => ({
        id: q.id,
        question: q.question,
        answer: answers[q.id] ?? "",
      })),
    );
  }

  const visible = showAll ? questions : questions.slice(0, 2);

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent-soft/50 p-5 sm:p-7">
      <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
        To be more sure
      </p>
      <h2 className="mt-1.5 text-lg font-semibold tracking-tight sm:text-xl">
        A couple more questions
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-body">
        Your answers make the answer more accurate. Pick one answer for each.
      </p>

      <div className="mt-6 space-y-6">
        {visible.map((q) => (
          <div key={q.id}>
            <p className="text-sm font-semibold text-ink">{q.question}</p>
            {q.why && (
              <p className="mt-1 text-xs leading-relaxed text-muted">{q.why}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {q.choices.map((choice) => {
                const active = answers[q.id] === choice;
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => pick(q, choice)}
                    aria-pressed={active}
                    className={`k-chip ${active ? "k-chip-on" : "k-chip-off"}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={free[q.id] ?? ""}
              onChange={(e) => type(q, e.target.value)}
              placeholder="Or type your own answer"
              className="k-input mt-3"
            />
          </div>
        ))}
      </div>

      {questions.length > 2 && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-5 text-sm font-semibold text-accent-strong link"
        >
          Show the last question
        </button>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={answered === 0 || isLoading}
          className="k-btn px-7"
        >
          {isLoading
            ? "Thinking…"
            : allAnswered
              ? "Get my better answer"
              : `Answer to continue (${answered}/${questions.length})`}
        </button>
        <button type="button" onClick={onCancel} className="k-btn-ghost px-5">
          Skip, I&apos;m done
        </button>
      </div>
    </div>
  );
}
