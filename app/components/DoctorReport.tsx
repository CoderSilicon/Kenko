"use client";

import {
  formatDateTime,
  type JournalEntry,
  parseSymptomParts,
} from "@/lib/journal";
import type { KenkoResult } from "@/lib/types";

const LIKELIHOOD_STYLES: Record<string, string> = {
  High: "text-danger",
  Moderate: "text-warning",
  Low: "text-muted",
};

function ConditionList({ result }: { result: KenkoResult }) {
  return (
    <ol className="space-y-4">
      {result.differential_analysis.map((dx) => (
        <li key={dx.condition_name} className="border-b border-line-soft pb-4">
          <div className="mb-1 flex items-baseline gap-3">
            <h4 className="text-sm font-semibold text-ink">
              {dx.condition_name}
            </h4>
            <span
              className={`text-xs font-semibold uppercase ${
                LIKELIHOOD_STYLES[dx.likelihood] ?? "text-muted"
              }`}
            >
              {dx.likelihood}
            </span>
          </div>
          <p className="text-[13px] font-normal leading-relaxed text-body">
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
      <p className="text-[13px] font-normal text-muted">
        Single evaluation on {formatDateTime(entry.createdAt)} — no follow-up
        check-ins recorded yet.
      </p>
    );
  }

  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr className="border-b border-ink text-left">
          <th className="py-1.5 pr-3 text-[10px] font-semibold tracking-wide text-muted uppercase">
            Date
          </th>
          <th className="py-1.5 pr-3 text-[10px] font-semibold tracking-wide text-muted uppercase">
            Severity
          </th>
          <th className="py-1.5 pr-3 text-[10px] font-semibold tracking-wide text-muted uppercase">
            Change
          </th>
          <th className="py-1.5 text-[10px] font-semibold tracking-wide text-muted uppercase">
            Note
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-b border-line-soft align-top">
            <td className="py-2.5 pr-3 font-normal text-ink">
              {formatDateTime(row.date)}
            </td>
            <td className="py-2.5 pr-3 font-semibold text-ink">
              {row.severity}/10
            </td>
            <td className="py-2.5 pr-3 font-normal text-body capitalize">
              {row.change}
            </td>
            <td className="py-2.5 font-normal text-body">{row.note || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
      {children}
    </h3>
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
    <div className="animate-in fade-in">
      {/* Toolbar */}
      <div className="no-print mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 pt-8 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="k-btn-ghost px-5 py-2.5"
        >
          <span aria-hidden="true">←</span>
          Back to journal
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="k-btn px-6 py-2.5"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Paper */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-10">
        <div className="overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-10 md:p-12">
          {/* Report header */}
          <div className="mb-8 border-b border-ink pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
                  Doctor-Prep Report
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-ink">
                  {entry.label}
                </h1>
              </div>
              <div className="text-right text-[11px] font-normal text-muted">
                <p className="font-medium text-body">Prepared by Kenko</p>
                <p>{formatDateTime(entry.createdAt)}</p>
                <p className="mt-1 text-faint">
                  AI-generated synopsis — not a diagnosis
                </p>
              </div>
            </div>
          </div>

          {/* Patient-submitted summary */}
          <section className="mb-8">
            <SectionLabel>Patient-reported summary</SectionLabel>
            <p className="text-sm font-normal leading-relaxed text-ink">
              {entry.primaryComplaint.split("Severity").slice(0, 1).join("")}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-line p-3">
                <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                  Location
                </p>
                <p className="mt-1 text-[13px] font-normal text-ink">
                  {parts.location.length > 0
                    ? parts.location.join(", ")
                    : "Not reported"}
                </p>
              </div>
              <div className="rounded-lg border border-line p-3">
                <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                  Onset
                </p>
                <p className="mt-1 text-[13px] font-normal text-ink">
                  {parts.onset ?? "Not reported"}
                </p>
              </div>
              <div className="rounded-lg border border-line p-3">
                <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                  Duration
                </p>
                <p className="mt-1 text-[13px] font-normal text-ink">
                  {parts.duration ?? "Not reported"}
                </p>
              </div>
            </div>
          </section>

          {/* Photos */}
          {entry.images.length > 0 && (
            <section className="mb-8">
              <SectionLabel>Photos provided</SectionLabel>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {entry.images.map((img) => (
                  <div
                    key={img.name}
                    className="overflow-hidden rounded-lg border border-line"
                  >
                    {/* biome-ignore lint/performance/noImgElement: stored data URL */}
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="aspect-square w-full object-cover"
                    />
                    <p className="truncate px-2 py-1.5 text-[10px] font-medium text-muted">
                      {img.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Timeline */}
          <section className="mb-8">
            <SectionLabel>Symptom timeline</SectionLabel>
            <TimelineTable entry={entry} />
          </section>

          {/* Triage */}
          <section className="mb-8 rounded-xl border border-line p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
                Recommended care level
              </p>
              <p className="text-sm font-semibold text-ink">
                {result.triage_level}
              </p>
            </div>
            <ul className="mt-3 space-y-1.5">
              {result.recommended_actions.map((action) => (
                <li
                  key={action}
                  className="flex items-start gap-2 text-[13px] font-normal text-body"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {action}
                </li>
              ))}
            </ul>
          </section>

          {/* Conditions */}
          <section className="mb-8">
            <SectionLabel>Conditions considered</SectionLabel>
            <ConditionList result={result} />
          </section>

          {/* Hypothesis */}
          <section className="mb-8">
            <SectionLabel>
              User&apos;s hypothesis:{" "}
              {result.user_hypothesis_analysis.user_suspected_condition ||
                "none provided"}
            </SectionLabel>
            <p className="text-[13px] font-normal leading-relaxed text-body">
              {result.user_hypothesis_analysis.clinical_reasoning}
            </p>
          </section>

          {/* Questions */}
          <section className="mb-8">
            <SectionLabel>Questions to ask your provider</SectionLabel>
            <ol className="space-y-2">
              {result.physician_consult_guide.map((q, i) => (
                <li
                  key={q}
                  className="flex items-start gap-3 text-[13px] font-normal text-ink"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-soft text-[10px] font-semibold text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {q}
                </li>
              ))}
            </ol>
          </section>

          {/* Disclaimer */}
          <div className="border-t border-line-soft pt-4">
            <p className="text-[10px] font-normal leading-relaxed text-muted">
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
