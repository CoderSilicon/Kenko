"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JOURNAL_EVENT, loadJournal } from "@/lib/journal";

export default function SiteHeader() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCount(loadJournal().length);
    refresh();
    window.addEventListener(JOURNAL_EVENT, refresh);
    return () => window.removeEventListener(JOURNAL_EVENT, refresh);
  }, []);

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-baseline gap-0.5 text-lg font-bold tracking-tight transition-opacity hover:opacity-70"
        >
          Kenko<span className="text-accent">.</span>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-soft hover:text-accent-strong"
          >
            Journal
            {count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-soft px-1.5 text-[11px] font-semibold text-accent-strong">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/evaluate"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-strong sm:px-5"
          >
            <span className="text-base leading-none">+</span>
            <span className="hidden sm:inline">New evaluation</span>
            <span className="inline sm:hidden">Evaluate</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
