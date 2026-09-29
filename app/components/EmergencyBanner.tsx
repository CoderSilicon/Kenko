"use client";

import type { RedFlagPayload } from "@/lib/learnTypes";

/**
 * The big red banner. Shown first, always above everything else, whenever a
 * danger sign is found. Says exactly what to do, in one short line.
 */
export default function EmergencyBanner({
  flags,
  warning,
}: {
  flags: RedFlagPayload[];
  warning: string | null;
}) {
  if (flags.length === 0 && !warning) return null;

  return (
    <div className="mt-6 rounded-2xl bg-danger px-6 py-6 text-white shadow-lg shadow-danger/25">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/50 text-lg font-bold"
        >
          !
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-wide uppercase">
            Get help now
          </p>

          {flags.map((f) => (
            <p key={f.id} className="mt-2 text-sm leading-relaxed">
              <span className="font-semibold">{f.title}.</span> {f.advice}
            </p>
          ))}

          {warning && flags.length === 0 && (
            <p className="mt-2 text-sm leading-relaxed">{warning}</p>
          )}

          <p className="mt-4 text-sm font-semibold">
            Call your local emergency number now, or get to the nearest
            emergency room. Do not wait.
          </p>
        </div>
      </div>
    </div>
  );
}
