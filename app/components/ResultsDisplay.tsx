"use client";

import type { LearnLink, RedFlagPayload } from "@/lib/learnTypes";
import type { KenkoResult } from "@/lib/types";
import EmergencyBanner from "./EmergencyBanner";
import FollowUpQuestions from "./FollowUpQuestions";
import LearnMore from "./LearnMore";

/* ── Small shared bits ───────────────────────────────────────────── */

const TRIAGE: Record<
  string,
  { label: string; kid: string; color: string; bg: string; pct: number }
> = {
  "Self-Care & Monitor": {
    label: "Self-Care & Monitor",
    kid: "Look after it at home",
    color: "text-success",
    bg: "bg-success-soft",
    pct: 25,
  },
  "Primary Care Appointment": {
    label: "Primary Care",
    kid: "See your doctor",
    color: "text-warning",
    bg: "bg-warning-soft",
    pct: 50,
  },
  "Specialist Referral": {
    label: "Specialist Referral",
    kid: "See a specialist",
    color: "text-alert",
    bg: "bg-alert-soft",
    pct: 75,
  },
  "Immediate Emergency Care": {
    label: "Emergency Care",
    kid: "Get help right now",
    color: "text-danger",
    bg: "bg-danger-soft",
    pct: 100,
  },
};

const VERDICT: Record<string, { label: string; tint: string }> = {
  Consistent: {
    label: "Your guess fits",
    tint: "bg-success-soft text-success",
  },
  "Partially Consistent": {
    label: "Your guess partly fits",
    tint: "bg-warning-soft text-warning",
  },
  Unlikely: {
    label: "Your guess does not fit",
    tint: "bg-danger-soft text-danger",
  },
};

const LIKELIHOOD_BAR: Record<string, { width: string; color: string }> = {
  High: { width: "w-full", color: "bg-danger/70" },
  Moderate: { width: "w-2/3", color: "bg-warning" },
  Low: { width: "w-1/3", color: "bg-faint" },
};

const LIKELIHOOD_TINT: Record<string, string> = {
  High: "bg-danger/10 text-danger",
  Moderate: "bg-warning-soft text-warning",
  Low: "bg-soft text-muted",
};

const ORDER: Record<string, number> = { High: 0, Moderate: 1, Low: 2 };

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="mb-4 text-lg font-semibold tracking-tight sm:text-xl">
      {title}
    </h2>
  );
}

/** The care level, in one big readable shape. */
function CareLevel({ triageLevel }: { triageLevel: string }) {
  const config = TRIAGE[triageLevel] ?? TRIAGE["Self-Care & Monitor"];
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex h-32 w-32 items-center justify-center rounded-full ${config.bg}`}
      >
        <span
          className={`text-center text-2xl leading-tight font-bold px-3 ${config.color}`}
        >
          {config.kid}
        </span>
      </div>
    </div>
  );
}

function Indicators({
  matching,
  differentiating,
}: {
  matching: string[];
  differentiating: string[];
}) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {matching.map((t) => (
        <span key={`m-${t}`} className="k-pill bg-success-soft text-success">
          <span className="h-1 w-1 rounded-full bg-success" />
          {t}
        </span>
      ))}
      {differentiating.map((t) => (
        <span key={`d-${t}`} className="k-pill bg-soft text-muted">
          <span className="h-1 w-1 rounded-full bg-faint" />
          {t}
        </span>
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */

export default function ResultsDisplay({
  result,
  redFlags = [],
  learn = [],
  followupQuestions = [],
  onAnswerFollowUps,
  onSkipFollowUps,
  onPrepareReport,
  onViewJournal,
  isRefining = false,
}: {
  result: KenkoResult;
  redFlags?: RedFlagPayload[];
  learn?: LearnLink[];
  followupQuestions?: KenkoResult["followup_questions"];
  onAnswerFollowUps?: (
    answers: Array<{ id: string; question: string; answer: string }>,
  ) => void;
  onSkipFollowUps?: () => void;
  onPrepareReport: () => void;
  onViewJournal: () => void;
  isRefining?: boolean;
}) {
  const sorted = [...(result.differential_analysis ?? [])].sort(
    (a, b) => (ORDER[a.likelihood] ?? 3) - (ORDER[b.likelihood] ?? 3),
  );
  const top = sorted[0];
  const rest = sorted.slice(1);
  const guess = result.user_hypothesis_analysis;
  const verdict = VERDICT[guess?.verdict ?? ""];
  const showFollowUps =
    !result.is_emergency && followupQuestions.length > 0 && !!onAnswerFollowUps;

  return (
    <div className="animate-in slide-up">
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Your result
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onViewJournal}
              className="k-btn-ghost px-4 py-2"
            >
              My journal
            </button>
            <button
              type="button"
              onClick={onPrepareReport}
              className="k-btn px-4 py-2"
            >
              For my doctor
            </button>
          </div>
        </div>

        {/* Danger first, always */}
        <EmergencyBanner flags={redFlags} warning={result.emergency_warning} />

        {/* The answer, in plain words */}
        <section className="mt-6 k-card p-6 sm:p-8">
          <div className="grid items-center gap-7 md:grid-cols-[auto_1fr]">
            <CareLevel triageLevel={result.triage_level} />
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
                The short version
              </p>
              <p className="mt-2 text-lg leading-relaxed font-medium text-ink">
                {result.kenko_eval_summary}
              </p>
              {result.plain_summary && (
                <p className="mt-3 rounded-xl bg-soft px-4 py-3 text-sm leading-relaxed text-body">
                  <span className="font-semibold">
                    In really simple words:{" "}
                  </span>
                  {result.plain_summary}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Follow-up questions */}
        {showFollowUps && (
          <div className="mt-6">
            <FollowUpQuestions
              questions={followupQuestions}
              onSubmit={
                onAnswerFollowUps as NonNullable<typeof onAnswerFollowUps>
              }
              onCancel={onSkipFollowUps as NonNullable<typeof onSkipFollowUps>}
              isLoading={isRefining}
            />
          </div>
        )}

        {/* Most likely */}
        {top && (
          <section className="mt-10">
            <SectionHeading title="Most likely" />
            <div className="k-card p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-semibold tracking-tight">
                  {top.condition_name}
                </h3>
                <span
                  className={`k-pill ${
                    LIKELIHOOD_TINT[top.likelihood] ?? "bg-soft text-muted"
                  }`}
                >
                  {top.likelihood} chance
                </span>
              </div>

              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
                <div
                  className={`h-full rounded-full ${
                    LIKELIHOOD_BAR[top.likelihood]?.color ?? "bg-faint"
                  } ${LIKELIHOOD_BAR[top.likelihood]?.width ?? "w-1/3"}`}
                />
              </div>

              <p className="mt-5 text-sm leading-relaxed text-body">
                {top.clinical_overview}
              </p>
              <Indicators
                matching={top.matching_indicators ?? []}
                differentiating={top.differentiating_indicators ?? []}
              />
            </div>
          </section>
        )}

        {/* Other possibilities */}
        {rest.length > 0 && (
          <section className="mt-10">
            <SectionHeading title="Other things it could be" />
            <div className="space-y-4">
              {rest.map((dx, i) => {
                const bar = LIKELIHOOD_BAR[dx.likelihood] ?? LIKELIHOOD_BAR.Low;
                return (
                  <div key={dx.condition_name} className="k-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-soft text-xs font-semibold text-muted">
                          {i + 2}
                        </span>
                        <h4 className="text-base font-semibold">
                          {dx.condition_name}
                        </h4>
                      </div>
                      <span
                        className={`k-pill ${
                          LIKELIHOOD_TINT[dx.likelihood] ?? "bg-soft text-muted"
                        }`}
                      >
                        {dx.likelihood} chance
                      </span>
                    </div>

                    <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-line-soft">
                      <div
                        className={`h-full rounded-full ${bar.color} ${bar.width}`}
                      />
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-body">
                      {dx.clinical_overview}
                    </p>
                    <Indicators
                      matching={dx.matching_indicators ?? []}
                      differentiating={dx.differentiating_indicators ?? []}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Their guess */}
        {guess?.user_suspected_condition && (
          <section className="mt-10">
            <SectionHeading title="What you thought it was" />
            <div className="k-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="text-base font-semibold">
                  {guess.user_suspected_condition}
                </h4>
                {verdict && (
                  <span className={`k-pill ${verdict.tint}`}>
                    {verdict.label}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-body">
                {guess.clinical_reasoning}
              </p>
            </div>
          </section>
        )}

        {/* What to do now */}
        {result.recommended_actions?.length > 0 && (
          <section className="mt-10">
            <SectionHeading title="What to do now" />
            <div className="grid gap-3 md:grid-cols-2">
              {result.recommended_actions.map((action, i) => (
                <div
                  key={action}
                  className="flex items-start gap-4 rounded-xl border border-line bg-surface px-5 py-4 shadow-sm"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-strong">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-body">{action}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Questions to ask */}
        {result.physician_consult_guide?.length > 0 && (
          <section className="mt-10">
            <SectionHeading title="Questions to ask your doctor" />
            <div className="k-card p-6">
              <ul className="space-y-3">
                {result.physician_consult_guide.map((q) => (
                  <li
                    key={q}
                    className="flex items-start gap-3 text-sm text-body"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-soft text-[11px] font-semibold text-muted">
                      ?
                    </span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* How sure */}
        {result.confidence_note && (
          <section className="mt-10">
            <SectionHeading title="How sure are we?" />
            <div className="rounded-2xl border border-line bg-soft px-6 py-5">
              <p className="text-sm leading-relaxed text-body">
                {result.confidence_note}
              </p>
              {result.additional_warning && (
                <p className="mt-3 rounded-xl border border-warning/25 bg-warning-soft px-4 py-3 text-sm leading-relaxed text-warning">
                  <span className="font-semibold">Also worth knowing: </span>
                  {result.additional_warning}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Trusted reading */}
        <LearnMore links={learn} />

        {/* Next steps */}
        <section className="mt-10 no-print">
          <SectionHeading title="What next?" />
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={onPrepareReport}
              className="group flex flex-col items-start rounded-2xl bg-accent p-6 text-left text-white shadow-md shadow-accent/20 transition-all hover:shadow-lg"
            >
              <span className="text-sm font-bold">1</span>
              <span className="mt-4 text-sm font-semibold">
                Print a page for my doctor
              </span>
              <span className="mt-1 text-xs leading-relaxed text-white/75">
                One clean sheet with everything they need.
              </span>
            </button>
            <button
              type="button"
              onClick={onViewJournal}
              className="group flex flex-col items-start rounded-2xl border border-line bg-surface p-6 text-left shadow-sm transition-all hover:border-accent hover:shadow-md"
            >
              <span className="text-sm font-bold text-accent-strong">2</span>
              <span className="mt-4 text-sm font-semibold text-ink">
                Keep track of how it changes
              </span>
              <span className="mt-1 text-xs leading-relaxed text-muted">
                A quick daily check-in shows if you are getting better.
              </span>
            </button>
          </div>
        </section>

        <p className="mt-10 pb-12 text-center text-xs leading-relaxed text-muted">
          Kenko is a learning tool, not a doctor. It cannot diagnose or treat
          you. Always check with a real healthcare professional before you
          decide what to do.
        </p>
      </div>
    </div>
  );
}
