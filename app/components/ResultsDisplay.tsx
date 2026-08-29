"use client";

import type { KenkoResult } from "@/lib/types";

const triageConfig: Record<
  string,
  { label: string; color: string; bg: string; ring: string; pct: number }
> = {
  "Self-Care & Monitor": {
    label: "Self-Care & Monitor",
    color: "text-success",
    bg: "bg-success-soft",
    ring: "stroke-success",
    pct: 25,
  },
  "Primary Care Appointment": {
    label: "Primary Care",
    color: "text-warning",
    bg: "bg-warning-soft",
    ring: "stroke-warning",
    pct: 50,
  },
  "Specialist Referral": {
    label: "Specialist Referral",
    color: "text-alert",
    bg: "bg-alert-soft",
    ring: "stroke-alert",
    pct: 75,
  },
  "Immediate Emergency Care": {
    label: "Emergency Care",
    color: "text-danger",
    bg: "bg-danger-soft",
    ring: "stroke-danger",
    pct: 100,
  },
};

const verdictConfig: Record<string, { label: string; tint: string }> = {
  Consistent: { label: "Consistent", tint: "bg-success-soft text-success" },
  "Partially Consistent": {
    label: "Partially Consistent",
    tint: "bg-warning-soft text-warning",
  },
  Unlikely: { label: "Unlikely", tint: "bg-danger-soft text-danger" },
};

const likelihoodBar: Record<string, { width: string; color: string }> = {
  High: { width: "w-full", color: "bg-danger/70" },
  Moderate: { width: "w-2/3", color: "bg-warning" },
  Low: { width: "w-1/3", color: "bg-faint" },
};

const likelihoodTint: Record<string, string> = {
  High: "bg-danger/10 text-danger",
  Moderate: "bg-warning-soft text-warning",
  Low: "bg-soft text-muted",
};

function SeverityGauge({ triageLevel }: { triageLevel: string }) {
  const config =
    triageConfig[triageLevel] ?? triageConfig["Self-Care & Monitor"];
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (config.pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-44">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 180 180"
          role="img"
          aria-label="Triage severity gauge"
        >
          <title>Triage Severity Gauge</title>
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#e8e5df"
            strokeWidth="4"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${config.ring} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-semibold ${config.color}`}>
            {config.pct}
          </span>
          <span className="text-xs font-medium text-muted">/ 100</span>
        </div>
      </div>
      <span className={`k-pill mt-4 ${config.bg} ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

const likelihoodOrder: Record<string, number> = {
  High: 0,
  Moderate: 1,
  Low: 2,
};

function sortDifferential(
  arr: KenkoResult["differential_analysis"],
): KenkoResult["differential_analysis"] {
  return [...arr].sort(
    (a, b) =>
      (likelihoodOrder[a.likelihood] ?? 3) -
      (likelihoodOrder[b.likelihood] ?? 3),
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title?: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
        {eyebrow}
      </p>
      {title && (
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight">{title}</h2>
      )}
    </div>
  );
}

export default function ResultsDisplay({
  result,
  onPrepareReport,
  onViewJournal,
}: {
  result: KenkoResult;
  onPrepareReport: () => void;
  onViewJournal: () => void;
}) {
  const sorted = sortDifferential(result.differential_analysis);
  const topPick = sorted[0];
  const others = sorted.slice(1);
  const vc =
    verdictConfig[result.user_hypothesis_analysis.verdict] ??
    verdictConfig.Unlikely;

  return (
    <div className="animate-in slide-up">
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Evaluation results
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onViewJournal}
              className="k-btn-ghost px-4 py-2"
            >
              Journal
            </button>
            <button
              type="button"
              onClick={onPrepareReport}
              className="k-btn px-4 py-2"
            >
              Doctor report
            </button>
          </div>
        </div>

        {/* Emergency */}
        {result.is_emergency && (
          <div className="mt-6 flex items-start gap-4 rounded-2xl bg-danger px-6 py-5 text-white shadow-lg shadow-danger/25">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 text-base font-bold">
              !
            </span>
            <div>
              <p className="text-sm font-bold tracking-wide uppercase">
                Emergency
              </p>
              <p className="mt-1 text-sm font-light leading-relaxed text-white/95">
                {result.emergency_warning}
              </p>
              <p className="mt-2 text-xs font-medium text-white/70">
                Call emergency services immediately or go to your nearest
                emergency room.
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        <section className="mt-6 k-card p-6 sm:p-8">
          <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
            <SeverityGauge triageLevel={result.triage_level} />
            <div>
              <SectionHeading eyebrow="Summary" />
              <p className="text-[15px] font-normal leading-relaxed text-body">
                {result.kenko_eval_summary}
              </p>
            </div>
          </div>
        </section>

        {/* Top Pick */}
        {topPick && (
          <section className="mt-10">
            <SectionHeading eyebrow="Most likely" />
            <div className="k-card p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight">
                  {topPick.condition_name}
                </h2>
                <span
                  className={`k-pill ${likelihoodTint[topPick.likelihood] ?? "bg-soft text-muted"}`}
                >
                  {topPick.likelihood} likelihood
                </span>
              </div>

              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    likelihoodBar[topPick.likelihood]?.color ?? "bg-faint"
                  } ${likelihoodBar[topPick.likelihood]?.width ?? "w-1/3"}`}
                />
              </div>

              <p className="mt-5 text-sm font-normal leading-relaxed text-body">
                {topPick.clinical_overview}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {topPick.matching_indicators.map((ind) => (
                  <span
                    key={ind}
                    className="k-pill bg-success-soft text-success"
                  >
                    <span className="h-1 w-1 rounded-full bg-success" />
                    {ind}
                  </span>
                ))}
                {topPick.differentiating_indicators.map((ind) => (
                  <span key={ind} className="k-pill bg-soft text-muted">
                    <span className="h-1 w-1 rounded-full bg-faint" />
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Other Possibilities */}
        {others.length > 0 && (
          <section className="mt-10">
            <SectionHeading eyebrow="Other possibilities" />
            <div className="space-y-4">
              {others.map((dx, i) => {
                const lb = likelihoodBar[dx.likelihood] ?? likelihoodBar.Low;
                return (
                  <div key={dx.condition_name} className="k-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-soft text-xs font-semibold text-muted">
                          {String(i + 2).padStart(2, "0")}
                        </span>
                        <h3 className="text-base font-semibold">
                          {dx.condition_name}
                        </h3>
                      </div>
                      <span
                        className={`k-pill ${likelihoodTint[dx.likelihood] ?? "bg-soft text-muted"}`}
                      >
                        {dx.likelihood}
                      </span>
                    </div>

                    <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-line-soft">
                      <div
                        className={`h-full rounded-full ${lb.color} ${lb.width}`}
                      />
                    </div>

                    <p className="mt-4 text-sm font-normal leading-relaxed text-body">
                      {dx.clinical_overview}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {dx.matching_indicators.map((ind) => (
                        <span
                          key={ind}
                          className="k-pill bg-success-soft text-success"
                        >
                          <span className="h-1 w-1 rounded-full bg-success" />
                          {ind}
                        </span>
                      ))}
                      {dx.differentiating_indicators.map((ind) => (
                        <span key={ind} className="k-pill bg-soft text-muted">
                          <span className="h-1 w-1 rounded-full bg-faint" />
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Hypothesis */}
        <section className="mt-10">
          <SectionHeading eyebrow="Your hypothesis" />
          <div className="k-card p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-base font-semibold">
                {result.user_hypothesis_analysis.user_suspected_condition ||
                  "No hypothesis provided"}
              </h3>
              {result.user_hypothesis_analysis.user_suspected_condition && (
                <span className={`k-pill ${vc.tint}`}>{vc.label}</span>
              )}
            </div>
            <p className="mt-3 text-sm font-normal leading-relaxed text-body">
              {result.user_hypothesis_analysis.clinical_reasoning}
            </p>
          </div>
        </section>

        {/* Recommended Actions */}
        <section className="mt-10">
          <SectionHeading eyebrow="Recommended actions" />
          <div className="grid gap-3 md:grid-cols-2">
            {result.recommended_actions.map((action, i) => (
              <div
                key={action}
                className="flex items-start gap-4 rounded-xl border border-line bg-surface px-5 py-4 shadow-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-strong">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm font-normal leading-relaxed text-body">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Physician Consult */}
        <section className="mt-10">
          <SectionHeading eyebrow="Questions for your doctor" />
          <div className="k-card p-6">
            <ul className="space-y-3">
              {result.physician_consult_guide.map((q, i) => (
                <li
                  key={q}
                  className="flex items-start gap-3 text-sm text-body"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-soft text-[11px] font-semibold text-muted">
                    {i + 1}
                  </span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Next Steps */}
        <section className="mt-10 no-print">
          <SectionHeading eyebrow="Next steps" />
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={onPrepareReport}
              className="group flex flex-col items-start rounded-2xl bg-accent p-6 text-left text-white shadow-md shadow-accent/20 transition-all hover:shadow-lg"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-bold transition-transform group-hover:translate-x-0.5">
                01
              </span>
              <span className="mt-4 text-sm font-semibold">
                Prepare &amp; print your doctor report
              </span>
              <span className="mt-1 text-xs font-light leading-relaxed text-white/75">
                A structured summary to bring to a clinician.
              </span>
            </button>
            <button
              type="button"
              onClick={onViewJournal}
              className="group flex flex-col items-start rounded-2xl border border-line bg-surface p-6 text-left shadow-sm transition-all hover:border-accent hover:shadow-md"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-strong transition-transform group-hover:translate-x-0.5">
                02
              </span>
              <span className="mt-4 text-sm font-semibold text-ink">
                Track this in your symptom journal
              </span>
              <span className="mt-1 text-xs font-light leading-relaxed text-muted">
                Check in daily to spot trends.
              </span>
            </button>
          </div>
        </section>

        {/* Disclaimer */}
        <p className="mt-10 pb-12 text-center text-[11px] font-light leading-loose text-muted">
          This evaluation is generated by AI for educational purposes only. It
          is not a medical diagnosis. Accuracy is not guaranteed. Always confirm
          with a licensed healthcare provider.
        </p>
      </div>
    </div>
  );
}
