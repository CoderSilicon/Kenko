import type { LearnLink, RedFlagPayload } from "./types";

export type { LearnLink, RedFlagPayload };

export interface MedlineResultShape {
  query?: string;
  count?: number;
  topics?: LearnLink[];
  error?: string;
  area?: { id: string; label: string; kidLabel: string; emoji: string };
}
