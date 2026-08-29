"use client";

import { useState } from "react";
import {
  type CheckIn,
  formatDate,
  formatDateTime,
  type JournalEntry,
} from "@/lib/journal";
import TrendChart, { type TrendPoint } from "./TrendChart";

interface JournalViewProps {
  entries: JournalEntry[];
  onStart: () => void;
  onOpenReport: (id: string) => void;
  onCheckIn: (id: string, checkIn: CheckIn) => void;
  onDelete: (id: string) => void;
}

const CHANGE_STYLES: Record<
  CheckIn["change"],
  { label: string; tint: string; text: string; active: string }
> = {
  better: {
    label: "Better",
    tint: "bg-success-soft text-success",
    text: "text-success",
    active: "border-success bg-success text-white",
  },
  same: {
    label: "Same",
    tint: "bg-warning-soft text-warning",
    text: "text-warning",
    active: "border-warning bg-warning text-white",
  },
  worse: {
    label: "Worse",
    tint: "bg-danger-soft text-danger",
    text: "text-danger",
    active: "border-danger bg-danger text-white",
  },
};

function latestState(entry: JournalEntry) {
  const last =
    entry.checkIns.length > 0
      ? entry.checkIns[entry.checkIns.length - 1]
      : null;
  return {
    latest: last?.severity ?? entry.baselineSeverity,
    change: last?.change ?? null,
  };
}

function EntryCard({
  entry,
  onOpenReport,
  onCheckIn,
  onDelete,
}: {
  entry: JournalEntry;
  onOpenReport: (id: string) => void;
  onCheckIn: (id: string, checkIn: CheckIn) => void;
  onDelete: (id: string) => void;
}) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [change, setChange] = useState<CheckIn["change"]>("same");
  const [severity, setSeverity] = useState(
    Math.max(1, Math.min(10, latestState(entry).latest)),
  );
  const [note, setNote] = useState("");

  const { latest, change: latestChange } = latestState(entry);
  const points: TrendPoint[] = [
    { date: entry.createdAt, severity: entry.baselineSeverity },
    ...entry.checkIns.map((c) => ({ date: c.date, severity: c.severity })),
  ];
  const days = Math.max(
    0,
    Math.round(
      (points[points.length - 1].date - entry.createdAt) /
        (24 * 60 * 60 * 1000),
    ),
  );
  const delta = latest - entry.baselineSeverity;
  const changeMeta = latestChange ? CHANGE_STYLES[latestChange] : null;

  function submitCheckIn() {
    onCheckIn(entry.id, {
      id: `ci-${Date.now().toString(36)}`,
      date: Date.now(),
      severity,
      change,
      note: note.trim(),
    });
    setShowCheckIn(false);
    setNote("");
  }

  return (
    <div className="k-card overflow-hidden">
      {/* Card header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-5 sm:px-6">
        <div>
          <p className="text-xs font-medium text-muted">
            {formatDate(entry.createdAt)}
            {days > 0 && ` · tracked ${days}d`}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            {entry.label}
          </h2>
          {entry.conditionName && (
            <p className="mt-0.5 text-sm text-muted">
              Most likely:{" "}
              <span className="font-medium text-body">
                {entry.conditionName}
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {changeMeta && (
            <span className={`k-pill ${changeMeta.tint}`}>
              {changeMeta.label}
            </span>
          )}
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            aria-label={`Delete ${entry.label}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              role="img"
              aria-label="Delete"
            >
              <title>Delete</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-6 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-3xl font-semibold tracking-tight">
                {baselineSeverityDisplay(entry, latest)}
              </span>
              <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                baseline {entry.baselineSeverity}/10
              </span>
              <span className="text-xs text-muted">
                {delta === 0
                  ? "no change yet"
                  : delta < 0
                    ? `${Math.abs(delta)} pts better`
                    : `${delta} pts worse`}
              </span>
            </div>
            <TrendChart points={points} />
          </div>

          <div className="flex flex-col justify-between gap-6">
            {entry.checkIns.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                  Check-ins
                </p>
                {entry.checkIns
                  .slice(-3)
                  .reverse()
                  .map((c) => {
                    const meta = CHANGE_STYLES[c.change];
                    return (
                      <div
                        key={c.id}
                        className="flex items-start justify-between gap-3 rounded-lg bg-soft px-3.5 py-2.5"
                      >
                        <div>
                          <p className="text-sm font-medium text-body">
                            {formatDateTime(c.date)}
                          </p>
                          {c.note && (
                            <p className="mt-0.5 text-xs text-muted">
                              {c.note}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold">
                            {c.severity}/10
                          </p>
                          <p
                            className={`text-[11px] font-semibold uppercase ${meta.text}`}
                          >
                            {meta.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="mt-auto">
              <button
                type="button"
                onClick={() => setShowCheckIn((v) => !v)}
                className={`w-full ${showCheckIn ? "k-btn-ghost" : "k-btn"}`}
              >
                {showCheckIn ? "Cancel check-in" : "Check in today"}
              </button>
            </div>
          </div>
        </div>

        {/* Check-in form */}
        {showCheckIn && (
          <div className="mt-6 rounded-xl border border-accent/25 bg-accent-soft/40 p-5 sm:p-6">
            <p className="mb-4 text-sm font-semibold">How are you doing now?</p>
            <div className="flex flex-wrap gap-2">
              {(["better", "same", "worse"] as const).map((c) => {
                const meta = CHANGE_STYLES[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChange(c)}
                    className={`k-chip ${
                      change === c
                        ? meta.active
                        : "border-line bg-white text-body hover:border-accent hover:text-ink"
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex items-center gap-4">
              <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                Severity
              </span>
              <input
                type="range"
                min={1}
                max={10}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="w-8 text-right text-sm font-semibold">
                {severity}
              </span>
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note (max 80 chars)"
              maxLength={80}
              className="k-input mt-4"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCheckIn(false)}
                className="k-btn-ghost px-5 py-2.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCheckIn}
                className="k-btn px-6 py-2.5"
              >
                Save check-in
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="flex items-center gap-3 border-t border-line-soft px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={() => onOpenReport(entry.id)}
          className="k-btn-ghost px-4 py-2"
        >
          Doctor report
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

function baselineSeverityDisplay(entry: JournalEntry, latest: number) {
  if (latest === entry.baselineSeverity) return `${latest}/10`;
  return (
    <>
      <span className="text-muted">{entry.baselineSeverity}</span>
      <span aria-hidden="true"> → </span>
      {latest}
    </>
  );
}

export default function JournalView({
  entries,
  onStart,
  onOpenReport,
  onCheckIn,
  onDelete,
}: JournalViewProps) {
  if (entries.length === 0) {
    return (
      <div className="animate-in fade-in">
        <div className="k-card px-8 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft">
            <svg
              className="h-7 w-7 text-accent-strong"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              role="img"
              aria-label="Journal"
            >
              <title>Journal</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </span>
          <h2 className="mt-5 text-lg font-semibold">No evaluations yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-body">
            Your evaluations and trends will appear here.
          </p>
          <button type="button" onClick={onStart} className="k-btn mt-6 px-8">
            Start an evaluation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in">
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          onOpenReport={onOpenReport}
          onCheckIn={onCheckIn}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
