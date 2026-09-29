"use client";

import type { LearnLink } from "@/lib/learnTypes";

/** Trusted reading from MedlinePlus, shown under the results. */
export default function LearnMore({ links }: { links: LearnLink[] }) {
  if (links.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-5">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          Learn more
        </p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight">
          Read more about these topics
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
          >
            <h3 className="text-base font-semibold tracking-tight">
              {link.title}
            </h3>
            {link.snippet && (
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                {link.snippet}
              </p>
            )}
            <p className="mt-4 text-xs font-semibold text-accent-strong">
              MedlinePlus.gov
              <span
                aria-hidden="true"
                className="ml-1 inline-block transition-transform group-hover:translate-x-0.5"
              >
                ↗
              </span>
            </p>
          </a>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        These come from MedlinePlus.gov, the U.S. National Library of Medicine.
        They are background reading, not a diagnosis.
      </p>
    </section>
  );
}
