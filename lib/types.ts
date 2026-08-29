export interface KenkoResult {
  is_emergency: boolean;
  emergency_warning: string | null;
  kenko_eval_summary: string;
  user_hypothesis_analysis: {
    user_suspected_condition: string;
    verdict: string;
    clinical_reasoning: string;
  };
  differential_analysis: Array<{
    condition_name: string;
    likelihood: string;
    matching_indicators: string[];
    differentiating_indicators: string[];
    clinical_overview: string;
  }>;
  triage_level: string;
  recommended_actions: string[];
  physician_consult_guide: string[];
}
