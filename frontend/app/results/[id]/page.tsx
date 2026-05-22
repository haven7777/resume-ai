"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AnalysisResults from "@/components/AnalysisResults";
import { getResult } from "@/lib/api";
import type { AnalysisResult } from "@/types/analysis";

export default function SharedResultPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getResult(id)
      .then(setResult)
      .catch(() => setError(true));
  }, [id]);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#F5F3FF" }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }}
        />
        <div
          className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, #3B82F6, transparent)" }}
        />
      </div>

      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(245,243,255,0.85)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(124,58,237,0.1)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5">
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
            </Link>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold px-4 py-2 rounded-full border transition-colors hover:bg-white/60"
            style={{ color: "#7C3AED", borderColor: "rgba(124,58,237,0.3)" }}
          >
            Analyze My Resume
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!result && !error && (
          <div className="flex items-center justify-center py-32">
            <div
              className="w-12 h-12 rounded-full border-4 animate-spin"
              style={{ borderColor: "#EDE9FE", borderTopColor: "#7C3AED" }}
            />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="text-5xl">😕</div>
            <p className="font-medium" style={{ color: "#EF4444" }}>
              This analysis link is invalid or has expired.
            </p>
            <Link
              href="/"
              className="px-8 py-3 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)" }}
            >
              Run a New Analysis
            </Link>
          </div>
        )}

        {result && (
          <AnalysisResults result={result} onReset={() => (window.location.href = "/")} />
        )}
      </main>
    </div>
  );
}
