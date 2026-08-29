"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type JournalEntry, loadJournal } from "@/lib/journal";
import DoctorReport from "../../components/DoctorReport";

export default function ReportPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [entry, setEntry] = useState<JournalEntry | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!id) {
      setEntry(null);
      return;
    }
    setEntry(loadJournal().find((e) => e.id === id) ?? null);
  }, [id]);

  if (entry === undefined) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <div className="k-card mx-auto max-w-xl px-8 py-16 text-center">
          <p className="text-sm text-body">
            This evaluation could not be found.
          </p>
          <Link href="/journal" className="k-btn mt-6 px-8">
            View journal
          </Link>
        </div>
      </div>
    );
  }

  return <DoctorReport entry={entry} onBack={() => router.push("/journal")} />;
}
