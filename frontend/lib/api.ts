import type { AnalysisResult } from "@/types/analysis";
import { supabase } from "./supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getLocation(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const { city, country_name } = await res.json();
    if (city && country_name) return `${city}, ${country_name}`;
    if (country_name) return country_name;
    return null;
  } catch {
    return null;
  }
}

export async function analyzeResume(
  file: File,
  jobDescription: string
): Promise<AnalysisResult> {
  const location = await getLocation();

  const form = new FormData();
  form.append("file", file);
  form.append("job_description", jobDescription);
  if (location) form.append("location", location);

  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {};
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${API_BASE}/api/v1/analyze-resume`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("You've hit the analysis rate limit (20 per hour). Try again later.");
    }
    if (res.status === 504) {
      throw new Error("The analysis took too long. The backend may be cold-starting — please retry.");
    }
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `Server error ${res.status}`);
  }

  return res.json();
}

export interface AnalysisSummary {
  id: string;
  created_at: string;
  job_title: string | null;
  overall_score: number;
  quick_stats: { salary_range: string; match_rate: number } | null;
}

export async function getUserAnalyses(): Promise<AnalysisSummary[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return [];
  const res = await fetch(`${API_BASE}/api/v1/analyses`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("Too many requests — try again in a minute.");
    if (res.status === 401) throw new Error("Your session has expired. Please sign in again.");
    throw new Error("Failed to load analyses");
  }
  return res.json();
}

export async function getResult(analysisId: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/api/v1/results/${analysisId}`);
  if (!res.ok) throw new Error("Analysis not found");
  return res.json();
}

export async function downloadReport(result: AnalysisResult): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Sign in required to download the report.");
  }
  const res = await fetch(`${API_BASE}/api/v1/generate-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(result),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("PDF rate limit reached (30 per hour). Try again later.");
    if (res.status === 401) throw new Error("Sign in required to download the report.");
    throw new Error("Failed to generate report");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume-analysis-report.pdf";
  a.click();
  URL.revokeObjectURL(url);
}
