"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import AgentProgress from "@/components/AgentProgress";
import AnalysisResults from "@/components/AnalysisResults";
import UploadForm from "@/components/UploadForm";
import { analyzeResume } from "@/lib/api";
import type { AnalysisResult, AnalysisStage } from "@/types/analysis";

const STAGE_DELAYS: { stage: AnalysisStage; ms: number }[] = [
  { stage: "hr_agent", ms: 0 },
  { stage: "tech_agent", ms: 8000 },
  { stage: "market_agent", ms: 16000 },
];

export default function Home() {
  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(file: File, jobDescription: string) {
    setError(null);
    setResult(null);
    const timers = STAGE_DELAYS.map(({ stage: s, ms }) =>
      setTimeout(() => setStage(s), ms)
    );
    try {
      const data = await analyzeResume(file, jobDescription);
      timers.forEach(clearTimeout);
      setStage("done");
      setResult(data);
    } catch (err) {
      timers.forEach(clearTimeout);
      setStage("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function reset() {
    setStage("idle");
    setResult(null);
    setError(null);
  }

  const isAnalyzing = stage === "hr_agent" || stage === "tech_agent" || stage === "market_agent";

  return (
    <div className="min-h-[100dvh] relative overflow-x-hidden" style={{ background: "#F5F3FF" }}>
      {/* Gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }}
        />
        <div
          className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, #3B82F6, transparent)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #06B6D4, transparent)" }}
        />
      </div>

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(245,243,255,0.85)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(124,58,237,0.1)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="/"
            aria-label="ResumeAI — go to home"
            className="flex items-center gap-2.5 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 rounded-lg"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-extrabold"
              style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)", fontFamily: "var(--font-jakarta)" }}
            >
              R
            </div>
            <span
              className="font-extrabold text-lg tracking-tight"
              style={{ fontFamily: "var(--font-jakarta)", color: "#1E1B4B" }}
            >
              ResumeAI
            </span>
          </a>
          {stage !== "idle" && (
            <button
              onClick={reset}
              className="text-sm font-semibold px-4 py-2 rounded-full border transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
              style={{ color: "#7C3AED", borderColor: "rgba(124,58,237,0.3)" }}
            >
              New Analysis
            </button>
          )}
        </div>
      </nav>

      {/* Content — aria-live announces transitions to screen readers */}
      <main
        id="main-content"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
        aria-live="polite"
        aria-atomic="false"
      >
        {stage === "idle" && <UploadForm onSubmit={handleSubmit} />}

        {isAnalyzing && <AgentProgress stage={stage} />}

        {stage === "done" && result && (
          <AnalysisResults result={result} onReset={reset} />
        )}

        {stage === "error" && (
          <div className="flex flex-col items-center gap-4 py-24">
            <h1 className="sr-only">Analysis failed</h1>
            <AlertCircle size={48} className="text-red-400" aria-hidden="true" />
            <p className="font-medium" style={{ color: "#EF4444" }}>{error}</p>
            <button
              onClick={reset}
              className="px-8 py-3 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
              style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)" }}
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
