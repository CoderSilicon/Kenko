"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  addCheckIn,
  type CheckIn,
  type JournalEntry,
  loadJournal,
  removeEntry,
} from "@/lib/journal";
import JournalView from "../components/JournalView";

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEntries(loadJournal());
    setReady(true);
  }, []);

  const refresh = useCallback(() => setEntries(loadJournal()), []);

  function handleCheckIn(id: string, checkIn: CheckIn) {
    addCheckIn(id, checkIn);
    refresh();
  }

  function handleDelete(id: string) {
    removeEntry(id);
    refresh();
  }

  return (
    <div className="animate-in fade-in">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              My health journal
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              My health journal
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-body">
              Saved on this device. Check in each day to see if you are getting
              better.
            </p>
          </div>
          <Link href="/evaluate" className="k-btn">
            <span aria-hidden="true">+</span>
            New check
          </Link>
        </div>

        {ready ? (
          <JournalView
            entries={entries}
            onStart={() => router.push("/evaluate")}
            onOpenReport={(id) => router.push(`/report/${id}`)}
            onCheckIn={handleCheckIn}
            onDelete={handleDelete}
          />
        ) : null}
      </div>
    </div>
  );
}
