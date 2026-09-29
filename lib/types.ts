export interface Differential {
  condition_name: string;
  likelihood: "High" | "Moderate" | "Low" | string;
  matching_indicators: string[];
  differentiating_indicators: string[];
  clinical_overview: string;
  /** Search term used to pull trusted MedlinePlus reading for this condition. */
  search_term?: string;
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  why: string;
  /** Shown as clickable choices under the question. */
  choices: string[];
}

export interface KenkoResult {
  is_emergency: boolean;
  emergency_warning: string | null;
  kenko_eval_summary: string;
  /** One extra line a child could understand. */
  plain_summary: string;
  user_hypothesis_analysis: {
    user_suspected_condition: string;
    verdict: string;
    clinical_reasoning: string;
  };
  differential_analysis: Differential[];
  triage_level: string;
  recommended_actions: string[];
  physician_consult_guide: string[];
  /** Up to 3 questions that would sharpen the answer most. */
  followup_questions: FollowUpQuestion[];
  /** Short, non-technical notes about how sure the AI is. */
  confidence_note: string;
  /** Extra warning only the AI spotted (not caught by the word scanner). */
  additional_warning: string | null;
}

/** One trusted reading link from MedlinePlus. */
export interface LearnLink {
  title: string;
  url: string;
  snippet: string;
  groups: string[];
}

export interface RedFlagPayload {
  id: string;
  title: string;
  advice: string;
  matched: string[];
}
