"use client";

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

const triageConfig: Record<
  string,
  { label: string; color: string; bg: string; ring: string; pct: number }
> = {
  "Self-Care & Monitor": {
    label: "Self-Care & Monitor",
    color: "text-[#5a7a5a]",
    bg: "bg-[#eef3ee]",
    ring: "stroke-[#7a9a7a]",
    pct: 25,
  },
  "Primary Care Appointment": {
    label: "Primary Care",
    color: "text-[#8a7a4a]",
    bg: "bg-[#f5f0e6]",
    ring: "stroke-[#b0a060]",
    pct: 50,
  },
  "Specialist Referral": {
    label: "Specialist Referral",
    color: "text-[#8a6a3a]",
    bg: "bg-[#f5ede0]",
    ring: "stroke-[#c09050]",
    pct: 75,
  },
  "Immediate Emergency Care": {
    label: "Emergency Care",
    color: "text-[#8a3a3a]",
    bg: "bg-[#f5eaea]",
    ring: "stroke-[#c06060]",
    pct: 100,
  },
};

const verdictConfig: Record<
  string,
  { label: string; color: string; border: string }
> = {
  Consistent: {
    label: "Consistent",
    color: "text-[#5a7a5a]",
    border: "border-[#c8d8c8]",
  },
  "Partially Consistent": {
    label: "Partially Consistent",
    color: "text-[#8a7a4a]",
    border: "border-[#d8d0b8]",
  },
  Unlikely: {
    label: "Unlikely",
    color: "text-[#8a4a3a]",
    border: "border-[#d8c0b8]",
  },
};

const likelihoodBar: Record<string, { width: string; color: string }> = {
  High: { width: "w-full", color: "bg-[#b07070]" },
  Moderate: { width: "w-2/3", color: "bg-[#b0a060]" },
  Low: { width: "w-1/3", color: "bg-[#c4bbb0]" },
};

function SeverityGauge({ triageLevel }: { triageLevel: string }) {
  const config =
    triageConfig[triageLevel] ?? triageConfig["Self-Care & Monitor"];
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (config.pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-48 w-48">
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
            stroke="#e8e4df"
            strokeWidth="3"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${config.ring} transition-all duration-[1200ms] ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-light ${config.color}`}>
            {config.pct}
          </span>
          <span className="text-[10px] font-light tracking-wider text-[#a09890]">
            / 100
          </span>
        </div>
      </div>
      <p className={`mt-4 text-xs font-medium tracking-wider ${config.color}`}>
        {config.label}
      </p>
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

export default function ResultsDisplay({
  result,
  onReset,
}: {
  result: KenkoResult;
  onReset: () => void;
}) {
  const sorted = sortDifferential(result.differential_analysis);
  const topPick = sorted[0];
  const others = sorted.slice(1);

  return (
    <div className="w-full animate-in slide-up duration-600">
      {/* Reset */}
      <div className="w-full border-b border-[#e8e4df] bg-[#f0ece6] px-8 py-4 md:px-16">
        <button
          type="button"
          onClick={onReset}
          className="group inline-flex items-center gap-2 text-xs font-light tracking-wider text-[#8a8278] transition-colors hover:text-[#2c2c2c]"
        >
          <svg
            className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            role="img"
            aria-label="Go back"
          >
            <title>Go back</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          New Evaluation
        </button>
      </div>

      {/* Emergency */}
      {result.is_emergency && (
        <div className="w-full bg-[#8a3a3a] px-8 py-8 md:px-16 animate-in fade-in duration-300">
          <div className="flex items-start gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#c08080] text-lg text-[#f5eaea] animate-pulse">
              !
            </div>
            <div>
              <p className="text-sm font-medium tracking-wider text-[#f5eaea] uppercase">
                Emergency
              </p>
              <p className="mt-2 text-sm font-light leading-relaxed text-[#e0d0d0]">
                {result.emergency_warning}
              </p>
              <p className="mt-3 text-xs font-light text-[#c8b8b8]">
                Call emergency services immediately or go to your nearest
                emergency room.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gauge + Summary */}
      <div className="w-full px-8 py-16 md:px-16 md:py-20">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start">
          <SeverityGauge triageLevel={result.triage_level} />
          <div className="flex-1 text-center lg:text-left">
            <p className="mb-3 text-[10px] font-medium tracking-[0.3em] text-[#b8b0a6] uppercase">
              Summary
            </p>
            <p className="text-base font-light leading-loose text-[#3d3d3d]">
              {result.kenko_eval_summary}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full px-8 md:px-16">
        <div className="w-full border-t border-[#e8e4df]" />
      </div>

      {/* Top Pick — "You might have" */}
      {topPick && (
        <div className="w-full bg-[#f0ece6] px-8 py-12 md:px-16 md:py-16">
          <p className="mb-6 text-[10px] font-medium tracking-[0.3em] text-[#b8b0a6] uppercase">
            Most Likely
          </p>
          <div className="border border-[#d4c8bc] bg-[#faf8f5] p-8">
            <div className="mb-2 flex items-baseline gap-3">
              <span className="text-[10px] font-light tracking-wider text-[#b8b0a6]">
                01
              </span>
              <p className="text-[11px] font-light tracking-wider text-[#a09890]">
                You might have
              </p>
            </div>
            <h2 className="text-2xl font-light tracking-tight text-[#2c2c2c]">
              {topPick.condition_name}
            </h2>

            {/* Likelihood bar */}
            <div className="mt-6 mb-5 h-px w-full bg-[#e8e4df]">
              <div
                className={`h-full ${likelihoodBar[topPick.likelihood]?.color ?? "bg-[#c4bbb0]"} ${likelihoodBar[topPick.likelihood]?.width ?? "w-1/3"} transition-all duration-700 ease-out`}
              />
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] font-medium tracking-wider uppercase ${
                  topPick.likelihood === "High"
                    ? "text-[#8a4a3a]"
                    : topPick.likelihood === "Moderate"
                      ? "text-[#8a7a4a]"
                      : "text-[#a09890]"
                }`}
              >
                {topPick.likelihood} likelihood
              </span>
            </div>

            <p className="mt-5 text-sm font-light leading-relaxed text-[#6b6259]">
              {topPick.clinical_overview}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
              {topPick.matching_indicators.map((ind) => (
                <span
                  key={ind}
                  className="inline-flex items-center gap-2 text-xs font-light text-[#5a6a5a]"
                >
                  <span className="h-px w-3 bg-[#7a9a7a]" />
                  {ind}
                </span>
              ))}
              {topPick.differentiating_indicators.map((ind) => (
                <span
                  key={ind}
                  className="inline-flex items-center gap-2 text-xs font-light text-[#b8b0a6]"
                >
                  <span className="h-px w-3 bg-[#d4c8bc]" />
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other Possibilities */}
      {others.length > 0 && (
        <div className="w-full px-8 py-12 md:px-16 md:py-16">
          <p className="mb-8 text-[10px] font-medium tracking-[0.3em] text-[#b8b0a6] uppercase">
            Other Possibilities
          </p>
          <div className="space-y-4">
            {others.map((dx, i) => {
              const lb = likelihoodBar[dx.likelihood] ?? likelihoodBar.Low;
              return (
                <div
                  key={dx.condition_name}
                  className="border border-[#e8e4df] bg-[#faf8f5] p-6 transition-colors hover:bg-[#f5f0eb]"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-light tracking-wider text-[#b8b0a6]">
                        {String(i + 2).padStart(2, "0")}
                      </span>
                      <h3 className="text-sm font-medium text-[#2c2c2c]">
                        {dx.condition_name}
                      </h3>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] font-medium tracking-wider uppercase ${
                        dx.likelihood === "High"
                          ? "text-[#8a4a3a]"
                          : dx.likelihood === "Moderate"
                            ? "text-[#8a7a4a]"
                            : "text-[#a09890]"
                      }`}
                    >
                      {dx.likelihood}
                    </span>
                  </div>

                  <div className="mb-4 h-px w-full bg-[#e8e4df]">
                    <div
                      className={`h-full ${lb.color} ${lb.width} transition-all duration-700 ease-out`}
                    />
                  </div>

                  <p className="mb-4 text-sm font-light leading-relaxed text-[#8a8278]">
                    {dx.clinical_overview}
                  </p>

                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    {dx.matching_indicators.map((ind) => (
                      <span
                        key={ind}
                        className="inline-flex items-center gap-2 text-xs font-light text-[#5a6a5a]"
                      >
                        <span className="h-px w-3 bg-[#7a9a7a]" />
                        {ind}
                      </span>
                    ))}
                    {dx.differentiating_indicators.map((ind) => (
                      <span
                        key={ind}
                        className="inline-flex items-center gap-2 text-xs font-light text-[#b8b0a6]"
                      >
                        <span className="h-px w-3 bg-[#d4c8bc]" />
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="w-full px-8 md:px-16">
        <div className="w-full border-t border-[#e8e4df]" />
      </div>

      {/* Hypothesis */}
      <div className="w-full px-8 py-12 md:px-16 md:py-16">
        <p className="mb-6 text-[10px] font-medium tracking-[0.3em] text-[#b8b0a6] uppercase">
          Your Hypothesis
        </p>
        {(() => {
          const vc =
            verdictConfig[result.user_hypothesis_analysis.verdict] ??
            verdictConfig.Unlikely;
          return (
            <div className={`border ${vc.border} bg-[#faf8f5] p-6`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-[#2c2c2c]">
                  {result.user_hypothesis_analysis.user_suspected_condition}
                </span>
                <span
                  className={`text-[10px] font-medium tracking-wider ${vc.color} uppercase`}
                >
                  {vc.label}
                </span>
              </div>
              <p className="mt-4 text-sm font-light leading-relaxed text-[#6b6259]">
                {result.user_hypothesis_analysis.clinical_reasoning}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Divider */}
      <div className="w-full px-8 md:px-16">
        <div className="w-full border-t border-[#e8e4df]" />
      </div>

      {/* Quick Actions */}
      <div className="w-full bg-[#f0ece6] px-8 py-12 md:px-16 md:py-16">
        <p className="mb-8 text-[10px] font-medium tracking-[0.3em] text-[#b8b0a6] uppercase">
          Quick Actions
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {result.recommended_actions.map((action, i) => (
            <div
              key={action}
              className="flex items-start gap-4 border border-[#e8e4df] bg-[#faf8f5] p-5"
            >
              <span className="text-[10px] font-light tracking-wider text-[#b8b0a6]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm font-light leading-relaxed text-[#3d3d3d]">
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full px-8 md:px-16">
        <div className="w-full border-t border-[#e8e4df]" />
      </div>

      {/* Physician Consult */}
      <div className="w-full px-8 py-12 md:px-16 md:py-16">
        <div className="mb-6 flex items-center gap-3">
          <svg
            className="h-4 w-4 text-[#8a8278]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            role="img"
            aria-label="Questions for your doctor"
          >
            <title>Questions for your doctor</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
            />
          </svg>
          <p className="text-[10px] font-medium tracking-[0.3em] text-[#b8b0a6] uppercase">
            Questions for Your Doctor
          </p>
        </div>
        <ul className="space-y-3">
          {result.physician_consult_guide.map((q) => (
            <li
              key={q}
              className="flex items-start gap-3 text-sm font-light text-[#6b6259]"
            >
              <span className="mt-1 h-px w-4 shrink-0 bg-[#d4c8bc]" />
              {q}
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="w-full bg-[#f5f0eb] px-8 py-8 md:px-16">
        <p className="text-center text-[10px] font-light leading-loose text-[#b8b0a6]">
          This evaluation is generated by AI for educational purposes only. It
          is not a medical diagnosis. Accuracy is not guaranteed. Always confirm
          with a licensed healthcare provider.
        </p>
      </div>
    </div>
  );
}
