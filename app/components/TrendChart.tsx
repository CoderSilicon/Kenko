"use client";

import { formatDate } from "@/lib/journal";

export interface TrendPoint {
  date: number;
  severity: number;
}

export default function TrendChart({ points }: { points: TrendPoint[] }) {
  const W = 600;
  const H = 240;
  const PADX = 34;
  const PADY = 18;
  const iw = W - PADX * 2;
  const ih = H - PADY * 2;

  const sorted = [...points].sort((a, b) => a.date - b.date);
  if (sorted.length === 0) return null;

  const minDate = sorted[0].date;
  const maxDate = sorted[sorted.length - 1].date;
  const span = Math.max(1, maxDate - minDate);
  const x = (d: number) => PADX + ((d - minDate) / span) * iw;
  const y = (s: number) => PADY + ((10 - s) / 9) * ih;

  const path = sorted
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${x(p.date).toFixed(1)},${y(p.severity).toFixed(1)}`,
    )
    .join(" ");

  const gridLines = [1, 3, 5, 7, 10];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Symptom severity over time"
    >
      <title>Symptom severity over time</title>
      {gridLines.map((s) => (
        <line
          key={s}
          x1={PADX}
          x2={W - PADX}
          y1={y(s)}
          y2={y(s)}
          stroke={s === 5 ? "#d4c8bc" : "#ece8e2"}
          strokeWidth="1"
        />
      ))}
      {gridLines.map((s) => (
        <text
          key={`label-${s}`}
          x={PADX - 8}
          y={y(s) + 3}
          textAnchor="end"
          className="fill-[#b8b0a6]"
          fontSize="9"
        >
          {s}
        </text>
      ))}
      <path
        d={path}
        fill="none"
        stroke="#2c2c2c"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {sorted.map((p) => (
        <circle
          key={p.date}
          cx={x(p.date)}
          cy={y(p.severity)}
          r={p.date === maxDate ? 4 : 3}
          fill={p.date === maxDate ? "#2c2c2c" : "#8a8278"}
        >
          <title>
            {formatDate(p.date)} — {p.severity}/10
          </title>
        </circle>
      ))}
      <text x={PADX} y={H - 4} className="fill-[#b8b0a6]" fontSize="9">
        {formatDate(minDate)}
      </text>
      {span > 0 && (
        <text
          x={W - PADX}
          y={H - 4}
          textAnchor="end"
          className="fill-[#b8b0a6]"
          fontSize="9"
        >
          {formatDate(maxDate)}
        </text>
      )}
    </svg>
  );
}
