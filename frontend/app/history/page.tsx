"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Clock, ExternalLink, LogOut, TrendingUp } from "lucide-react";
import { getUserAnalyses, type AnalysisSummary } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : score >= 40 ? "#7C3AED" : "#EF4444";
  const bg =
    score >= 80 ? "rgba(16,185,129,0.1)" : score >= 60 ? "rgba(245,158,11,0.1)" : score >= 40 ? "rgba(124,58,237,0.1)" : "rgba(239,68,68,0.1)";
  return (
    <span
      className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full tabular-nums"
      style={{ background: bg, color }}
    >
      <TrendingUp size={12} aria-hidden="true" />
      {score}/100
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    getUserAnalyses()
      .then(setAnalyses)
      .catch(() => setError("Failed to load analyses. Please try again."))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: "#F5F3FF" }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] relative overflow-x-hidden" style={{ background: "#F5F3FF" }}>
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }} />
        <div className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, #3B82F6, transparent)" }} />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(245,243,255,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(124,58,237,0.1)" }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 rounded-lg">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-extrabold"
              style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)", fontFamily: "var(--font-jakarta)" }}>R</div>
            <span className="font-extrabold text-lg tracking-tight" style={{ fontFamily: "var(--font-jakarta)", color: "#1E1B4B" }}>ResumeAI</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs font-medium truncate max-w-[160px]" style={{ color: "#6B7280" }}>{user.email}</span>
            <button onClick={signOut} aria-label="Sign out"
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-full border transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
              style={{ color: "#7C3AED", borderColor: "rgba(124,58,237,0.3)" }}>
              <LogOut size={14} /><span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>Dashboard › History</p>
              <h1 className="text-3xl font-extrabold mt-1" style={{ fontFamily: "var(--font-jakarta)", color: "#1E1B4B" }}>
                My Analyses
              </h1>
            </div>
            <a href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
              style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)" }}>
              + New Analysis
            </a>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && analyses.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.08)" }}>
              <BarChart3 size={28} style={{ color: "#7C3AED" }} />
            </div>
            <div className="space-y-1">
              <p className="font-semibold" style={{ color: "#1E1B4B" }}>No analyses yet</p>
              <p className="text-sm" style={{ color: "#6B7280" }}>Upload your resume to get your first analysis.</p>
            </div>
            <a href="/"
              className="px-6 py-2.5 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)" }}>
              Analyze My Resume
            </a>
          </div>
        )}

        {/* List */}
        {!loading && analyses.length > 0 && (
          <div className="space-y-3">
            {analyses.map((a, i) => (
              <a key={a.id} href={`/results/${a.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 no-underline"
                style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(12px)", borderColor: "rgba(124,58,237,0.1)" }}>
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED" }}>
                    {analyses.length - i}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1E1B4B" }}>
                      Analysis #{analyses.length - i}
                    </p>
                    <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                      <Clock size={11} aria-hidden="true" />
                      {formatDate(a.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {a.quick_stats?.match_rate != null && (
                    <span className="hidden sm:block text-xs font-medium" style={{ color: "#6B7280" }}>
                      {a.quick_stats.match_rate}% match
                    </span>
                  )}
                  <ScoreBadge score={a.overall_score} />
                  <ExternalLink size={14} style={{ color: "#9CA3AF" }} aria-hidden="true" />
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
