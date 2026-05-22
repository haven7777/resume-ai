export interface AgentFeedback {
  score: number;
  summary: string;
  details: string[];
}

export interface PriorityItem {
  text: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface QuickStats {
  total_keywords: number;
  match_rate: number;
  experience_gap: string;
  salary_range: string;
}

export interface AnalysisResult {
  analysis_id?: string;
  overall_score: number;
  missing_keywords: string[];
  matched_keywords: string[];
  strengths: string[];
  agent_feedback: {
    hr_agent: AgentFeedback;
    tech_lead_agent: AgentFeedback;
    market_analyst_agent: AgentFeedback;
  };
  priority_improvements: PriorityItem[];
  action_items: PriorityItem[];
  skills_coverage: Record<string, number>;
  quick_stats: QuickStats;
}

export type AnalysisStage =
  | "idle"
  | "hr_agent"
  | "tech_agent"
  | "market_agent"
  | "done"
  | "error";
