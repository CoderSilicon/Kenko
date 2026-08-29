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
  { label: string; color: string; bg: string }
> = {
  better: {
    label: "Better",
    color: "text-[#5a7a5a]",
    bg: "bg-[#eef3ee] border-[#c8d8c8]",
  },
  same: {
    label: "Same",
    color: "text-[#8a7a4a]",
    bg: "bg-[#f5f0e6] border-[#d8d0b8]",
  },
  worse: {
    label: "Worse",
    color: "text-[#8a3a3a]",
    bg: "bg-[#f5eaea] border-[#d8c0b8]",
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
    <div className="border border-[#e8e4df] bg-[#faf8f5]">
      {/* Card header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e8e4df] px-6 py-5 md:px-8">
        <div>
          <p className="text-[10px] font-light tracking-wider text-[#a09890]">
            {formatDate(entry.createdAt)}
            {days > 0 && ` · tracked ${days}d`}
          </p>
          <h2 className="mt-1 text-lg font-light tracking-tight text-[#2c2c2c]">
            {entry.label}
          </h2>
          {entry.conditionName && (
            <p className="mt-1 text-xs font-light text-[#8a8278]">
              Most likely:{" "}
              <span className="text-[#6b6259]">{entry.conditionName}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {changeMeta && (
            <span
              className={`border px-3 py-1 text-[10px] font-medium tracking-wider uppercase ${changeMeta.bg} ${changeMeta.color}`}
            >
              {changeMeta.label}
            </span>
          )}
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            aria-label={`Delete ${entry.label}`}
            className="px-2 py-1 text-[10px] font-light tracking-wider text-[#b8b0a6] uppercase transition-colors hover:text-[#8a3a3a]"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-2xl font-light text-[#2c2c2c]">
                {baselineSeverityDisplay(entry, latest)}
              </span>
              <span className="text-[10px] font-medium tracking-wider text-[#b8b0a6] uppercase">
                baseline {entry.baselineSeverity}/10
              </span>
              <span className="text-[10px] font-light text-[#b8b0a6]">
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
              <div className="space-y-2">
                <p className="text-[10px] font-medium tracking-wider text-[#b8b0a6] uppercase">
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
                        className="flex items-start justify-between gap-3 border-b border-[#ece8e2] pb-2"
                      >
                        <div>
                          <p className="text-xs font-light text-[#6b6259]">
                            {formatDateTime(c.date)}
                          </p>
                          {c.note && (
                            <p className="mt-0.5 text-[11px] font-light text-[#a09890]">
                              {c.note}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-[#2c2c2c]">
                            {c.severity}/10
                          </p>
                          <p
                            className={`text-[9px] font-medium tracking-wider uppercase ${meta.color}`}
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
                className="w-full border border-[#2c2c2c] bg-[#2c2c2c] px-6 py-3 text-[11px] font-semibold tracking-[0.2em] text-[#faf8f5] uppercase transition-colors hover:bg-[#3d3d3d]"
              >
                {showCheckIn ? "Cancel check-in" : "Check in"}
              </button>
            </div>
          </div>
        </div>

        {/* Check-in form */}
        {showCheckIn && (
          <div className="mt-6 border border-[#d4c8bc] bg-[#f5f0eb] p-6">
            <p className="mb-4 text-[10px] font-medium tracking-[0.25em] text-[#8a8278] uppercase">
              How are you doing now?
            </p>
            <div className="flex flex-wrap gap-2">
              {(["better", "same", "worse"] as const).map((c) => {
                const meta = CHANGE_STYLES[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChange(c)}
                    className={`px-4 py-2 text-[11px] font-medium tracking-wider uppercase transition-colors ${
                      change === c
                        ? `border ${meta.bg} ${meta.color}`
                        : "border border-[#d4c8bc] text-[#8a8278] hover:border-[#b8b0a6]"
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex items-center gap-4">
              <span className="text-[10px] font-light tracking-wider text-[#8a8278] uppercase">
                Severity
              </span>
              <input
                type="range"
                min={1}
                max={10}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="flex-1 accent-[#2c2c2c]"
              />
              <span className="w-8 text-right text-sm font-light text-[#2c2c2c]">
                {severity}
              </span>
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note (max 80 chars)"
              maxLength={80}
              className="mt-4 w-full border-b border-[#d4c8bc] bg-transparent px-0 py-2 text-sm font-light text-[#2c2c2c] placeholder-[#c4bbb0] focus:border-[#8a8278] focus:outline-none"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCheckIn(false)}
                className="px-5 py-2 text-[11px] font-medium tracking-wider text-[#8a8278] uppercase transition-colors hover:text-[#2c2c2c]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCheckIn}
                className="bg-[#2c2c2c] px-6 py-2 text-[11px] font-semibold tracking-wider text-[#faf8f5] uppercase transition-colors hover:bg-[#3d3d3d]"
              >
                Save check-in
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="flex flex-wrap items-center gap-4 border-t border-[#e8e4df] px-6 py-4 md:px-8">
        <button
          type="button"
          onClick={() => onOpenReport(entry.id)}
          className="inline-flex items-center gap-2 text-[11px] font-medium tracking-wider text-[#6b6259] uppercase transition-colors hover:text-[#2c2c2c]"
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
      <span className="text-[#8a8278]">{entry.baselineSeverity}</span>
      <span className="text-[#b8b0a6]"> → </span>
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
  return (
    <div className="w-full max-w-3xl animate-in fade-in duration-500">
      <div className="mb-10">
        <p className="mb-3 flex items-center gap-3 text-[10px] font-medium tracking-[0.3em] text-[#8a8278] uppercase">
          <span className="h-px w-8 bg-[#8a8278]" />
          Your symptom history
        </p>
        <h1 className="text-2xl font-light tracking-tight text-[#2c2c2c] md:text-3xl">
          Symptom Journal
        </h1>
        <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-[#8a8278]">
          Every evaluation is saved here automatically. Check in over time to
          see how your symptoms are trending.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="border border-[#e8e4df] bg-[#f0ece6] px-8 py-16 text-center">
          <p className="text-sm font-light text-[#8a8278]">
            No evaluations yet. Your history and symptom trends will appear
            here.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-6 inline-flex items-center gap-2 border border-[#2c2c2c] bg-[#2c2c2c] px-8 py-3 text-[11px] font-semibold tracking-[0.2em] text-[#faf8f5] uppercase transition-colors hover:bg-[#3d3d3d]"
          >
            Start an evaluation
          </button>
        </div>
      ) : (
        <div className="space-y-6">
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
      )}
    </div>
  );
}
