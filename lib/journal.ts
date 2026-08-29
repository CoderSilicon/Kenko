import type { KenkoResult } from "./types";

export interface CheckIn {
  id: string;
  date: number;
  severity: number;
  change: "worse" | "same" | "better";
  note: string;
}

export interface StoredImage {
  name: string;
  dataUrl: string;
}

export interface JournalEntry {
  id: string;
  createdAt: number;
  label: string;
  primaryComplaint: string;
  baselineSeverity: number;
  conditionName: string | null;
  triageLevel: string;
  result: KenkoResult;
  images: StoredImage[];
  checkIns: CheckIn[];
}

const STORAGE_KEY = "kenko:journal";
const MAX_BYTES = 4.5 * 1024 * 1024;

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadJournal(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as JournalEntry[]) : [];
  } catch {
    return [];
  }
}

function persist(list: JournalEntry[]): JournalEntry[] {
  let out = list;
  let serialized = JSON.stringify(out);
  let guard = 0;
  while (serialized.length > MAX_BYTES && guard < 50) {
    const idx = out.findIndex((e) => e.images.length > 0);
    if (idx === -1) break;
    out = out.map((e, i) => (i === idx ? { ...e, images: [] } : e));
    serialized = JSON.stringify(out);
    guard++;
  }
  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(out.map((e) => ({ ...e, images: [] }))),
      );
    } catch {
      /* storage unavailable — journal is best-effort */
    }
  }
  return out;
}

export function saveEntry(entry: JournalEntry): JournalEntry[] {
  return persist([entry, ...loadJournal()]);
}

export function updateEntry(
  id: string,
  patch: Partial<Omit<JournalEntry, "id">>,
): JournalEntry[] {
  return persist(
    loadJournal().map((e) => (e.id === id ? { ...e, ...patch } : e)),
  );
}

export function removeEntry(id: string): JournalEntry[] {
  return persist(loadJournal().filter((e) => e.id !== id));
}

export function addCheckIn(id: string, checkIn: CheckIn): JournalEntry[] {
  const entry = loadJournal().find((e) => e.id === id);
  if (!entry) return loadJournal();
  return updateEntry(id, {
    checkIns: [...entry.checkIns, checkIn].sort((a, b) => a.date - b.date),
  });
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function parseBaseline(symptoms: string): number {
  const m = symptoms.match(/Severity:\s*(\d{1,2})\s*\/\s*10/);
  const n = m ? Number(m[1]) : 5;
  return Math.min(10, Math.max(1, n));
}

export function parseSymptomParts(symptoms: string): {
  location: string[];
  onset: string | null;
  duration: string | null;
} {
  const l = symptoms.match(/Location:\s*([^\n.]+)/);
  const o = symptoms.match(/Onset:\s*([^\n.]+)/);
  const d = symptoms.match(/Duration:\s*([^\n.]+)/);
  return {
    location: l
      ? l[1]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    onset: o ? o[1].trim() : null,
    duration: d ? d[1].trim() : null,
  };
}

export function downscaleImage(
  file: File,
  maxDim = 600,
  quality = 0.72,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function extractImages(
  formData: FormData,
): Promise<StoredImage[]> {
  const count = Number(formData.get("image_count") || "0");
  const out: StoredImage[] = [];
  for (let i = 0; i < count && i < 4; i++) {
    const file = formData.get(`image_${i}`) as File | null;
    if (!file || !file.type.startsWith("image/")) continue;
    try {
      out.push({ name: file.name, dataUrl: await downscaleImage(file) });
    } catch {
      /* skip unreadable image */
    }
  }
  return out;
}
