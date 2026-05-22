import type { AnalysisResult } from "@/types/analysis";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function checkHealth(): Promise<{ status: string; version: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend unreachable");
  return res.json();
}

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

  const res = await fetch(`${API_BASE}/api/v1/analyze-resume`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `Server error ${res.status}`);
  }

  return res.json();
}

export async function getResult(analysisId: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/api/v1/results/${analysisId}`);
  if (!res.ok) throw new Error("Analysis not found");
  return res.json();
}

export async function downloadReport(result: AnalysisResult): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/generate-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  });

  if (!res.ok) throw new Error("Failed to generate report");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume-analysis-report.pdf";
  a.click();
  URL.revokeObjectURL(url);
}
