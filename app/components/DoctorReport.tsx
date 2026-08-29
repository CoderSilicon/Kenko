"use client";

import {
  formatDateTime,
  type JournalEntry,
  parseSymptomParts,
} from "@/lib/journal";
import type { KenkoResult } from "@/lib/types";

const LIKELIHOOD_STYLES: Record<string, string> = {
  High: "text-[#8a3a3a]",
  Moderate: "text-[#8a7a4a]",
  Low: "text-[#a09890]",
};

function ConditionList({ result }: { result: KenkoResult }) {
  return (
    <ol className="space-y-4">
      {result.differential_analysis.map((dx) => (
        <li key={dx.condition_name} className="border-b border-[#ece8e2] pb-4">
          <div className="mb-1 flex items-baseline gap-3">
            <h4 className="text-[13px] font-medium text-[#2c2c2c]">
              {dx.condition_name}
            </h4>
            <span
              className={`text-[10px] font-medium tracking-wider uppercase ${LIKELIHOOD_STYLES[dx.likelihood] ?? "text-[#a09890]"}`}
            >
              {dx.likelihood}
            </span>
          </div>
          <p className="text-[12px] font-light leading-relaxed text-[#6b6259]">
            {dx.clinical_overview}
          </p>
        </li>
      ))}
    </ol>
  );
}

function TimelineTable({ entry }: { entry: JournalEntry }) {
  const rows: Array<{
    key: string;
    date: number;
    severity: number;
    change: string;
    note: string;
  }> = [
    {
      key: "baseline",
      date: entry.createdAt,
      severity: entry.baselineSeverity,
      change: "Baseline",
      note: "",
    },
    ...entry.checkIns.map((c) => ({
      key: c.id,
      date: c.date,
      severity: c.severity,
      change: c.change,
      note: c.note,
    })),
  ];

  if (rows.length === 1) {
    return (
      <p className="text-[12px] font-light text-[#8a8278]">
        Single evaluation on {formatDateTime(entry.createdAt)} — no follow-up
        check-ins recorded yet.
      </p>
    );
  }

  return (
    <table className="w-full border-collapse text-[12px]">
      <thead>
        <tr className="border-b border-[#2c2c2c] text-left">
          <th className="py-1 pr-3 text-[9px] font-medium tracking-wider text-[#8a8278] uppercase">
            Date
          </th>
          <th className="py-1 pr-3 text-[9px] font-medium tracking-wider text-[#8a8278] uppercase">
            Severity
          </th>
          <th className="py-1 pr-3 text-[9px] font-medium tracking-wider text-[#8a8278] uppercase">
            Change
          </th>
          <th className="py-1 text-[9px] font-medium tracking-wider text-[#8a8278] uppercase">
            Note
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-b border-[#ece8e2] align-top">
            <td className="py-2 pr-3 font-light text-[#2c2c2c]">
              {formatDateTime(row.date)}
            </td>
            <td className="py-2 pr-3 font-light text-[#2c2c2c]">
              {row.severity}/10
            </td>
            <td className="py-2 pr-3 font-light text-[#8a8278] capitalize">
              {row.change}
            </td>
            <td className="py-2 font-light text-[#6b6259]">
              {row.note || "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function DoctorReport({
  entry,
  onBack,
}: {
  entry: JournalEntry;
  onBack: () => void;
}) {
  const parts = parseSymptomParts(entry.primaryComplaint);
  const { result } = entry;

  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="no-print mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 pt-10 md:px-16">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium tracking-wider text-[#8a8278] uppercase transition-colors hover:text-[#2c2c2c]"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 border border-[#2c2c2c] bg-[#2c2c2c] px-6 py-3 text-[11px] font-semibold tracking-[0.2em] text-[#faf8f5] uppercase transition-colors hover:bg-[#3d3d3d]"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Paper */}
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-16">
        <div className="border border-[#e8e4df] bg-white p-8 md:p-12">
          {/* Report header */}
          <div className="mb-8 border-b border-[#2c2c2c] pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-[9px] font-medium tracking-[0.3em] text-[#8a8278] uppercase">
                  Doctor-Prep Report
                </p>
                <h1 className="text-2xl font-light tracking-tight text-[#2c2c2c]">
                  {entry.label}
                </h1>
              </div>
              <div className="text-right text-[10px] font-light text-[#8a8278]">
                <p>Prepared by Kenko</p>
                <p>{formatDateTime(entry.createdAt)}</p>
                <p className="mt-1 text-[#b8b0a6]">
                  AI-generated synopsis — not a diagnosis
                </p>
              </div>
            </div>
          </div>

          {/* Patient-submitted summary */}
          <section className="mb-8">
            <h3 className="mb-3 text-[10px] font-medium tracking-[0.25em] text-[#8a8278] uppercase">
              Patient-reported summary
            </h3>
            <p className="text-[13px] font-light leading-relaxed text-[#2c2c2c]">
              {entry.primaryComplaint.split("Severity").slice(0, 1).join("")}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="border border-[#ece8e2] p-3">
                <p className="text-[9px] font-medium tracking-wider text-[#b8b0a6] uppercase">
                  Location
                </p>
                <p className="mt-1 text-[12px] font-light text-[#2c2c2c]">
                  {parts.location.length > 0
                    ? parts.location.join(", ")
                    : "Not reported"}
                </p>
              </div>
              <div className="border border-[#ece8e2] p-3">
                <p className="text-[9px] font-medium tracking-wider text-[#b8b0a6] uppercase">
                  Onset
                </p>
                <p className="mt-1 text-[12px] font-light text-[#2c2c2c]">
                  {parts.onset ?? "Not reported"}
                </p>
              </div>
              <div className="border border-[#ece8e2] p-3">
                <p className="text-[9px] font-medium tracking-wider text-[#b8b0a6] uppercase">
                  Duration
                </p>
                <p className="mt-1 text-[12px] font-light text-[#2c2c2c]">
                  {parts.duration ?? "Not reported"}
                </p>
              </div>
            </div>
          </section>

          {/* Photos */}
          {entry.images.length > 0 && (
            <section className="mb-8">
              <h3 className="mb-3 text-[10px] font-medium tracking-[0.25em] text-[#8a8278] uppercase">
                Photos provided
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {entry.images.map((img) => (
                  <div key={img.name} className="border border-[#ece8e2]">
                    {/* biome-ignore lint/performance/noImgElement: stored data URL */}
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="aspect-square w-full object-cover"
                    />
                    <p className="truncate px-2 py-1.5 text-[9px] font-light text-[#8a8278]">
                      {img.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Timeline */}
          <section className="mb-8">
            <h3 className="mb-3 text-[10px] font-medium tracking-[0.25em] text-[#8a8278] uppercase">
              Symptom timeline
            </h3>
            <TimelineTable entry={entry} />
          </section>

          {/* Triage */}
          <section className="mb-8 border border-[#ece8e2] p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="text-[9px] font-medium tracking-[0.25em] text-[#8a8278] uppercase">
                Recommended care level
              </p>
              <p className="text-sm font-medium text-[#2c2c2c]">
                {result.triage_level}
              </p>
            </div>
            <ul className="mt-3 space-y-1.5">
              {result.recommended_actions.map((action) => (
                <li
                  key={action}
                  className="flex items-start gap-2 text-[12px] font-light text-[#6b6259]"
                >
                  <span className="mt-1.5 h-px w-3 shrink-0 bg-[#d4c8bc]" />
                  {action}
                </li>
              ))}
            </ul>
          </section>

          {/* Conditions */}
          <section className="mb-8">
            <h3 className="mb-3 text-[10px] font-medium tracking-[0.25em] text-[#8a8278] uppercase">
              Conditions considered
            </h3>
            <ConditionList result={result} />
          </section>

          {/* Hypothesis */}
          <section className="mb-8">
            <h3 className="mb-3 text-[10px] font-medium tracking-[0.25em] text-[#8a8278] uppercase">
              User&apos;s hypothesis:{" "}
              {result.user_hypothesis_analysis.user_suspected_condition ||
                "none provided"}
            </h3>
            <p className="text-[12px] font-light leading-relaxed text-[#6b6259]">
              {result.user_hypothesis_analysis.clinical_reasoning}
            </p>
          </section>

          {/* Questions */}
          <section className="mb-8">
            <h3 className="mb-3 text-[10px] font-medium tracking-[0.25em] text-[#8a8278] uppercase">
              Questions to ask your provider
            </h3>
            <ol className="space-y-2">
              {result.physician_consult_guide.map((q, i) => (
                <li
                  key={q}
                  className="flex items-start gap-3 text-[12px] font-light text-[#2c2c2c]"
                >
                  <span className="text-[10px] font-light tracking-wider text-[#b8b0a6]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {q}
                </li>
              ))}
            </ol>
          </section>

          {/* Disclaimer */}
          <div className="border-t border-[#ece8e2] pt-4">
            <p className="text-[9px] font-light leading-relaxed text-[#b8b0a6]">
              This document is an AI-generated educational summary produced by
              Kenko from patient-submitted information. It is not a medical
              diagnosis, does not replace clinical judgement, and may contain
              inaccuracies. Decisions about care should always be made with a
              licensed healthcare provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
