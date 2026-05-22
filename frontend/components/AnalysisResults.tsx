"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bot,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Code2,
  Download,
  Info,
  Loader2,
  RotateCcw,
  Share2,
} from "lucide-react";
import { downloadReport } from "@/lib/api";
import type { AgentFeedback, AnalysisResult, PriorityItem } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

function ScoreRing({
  score,
  label,
  sublabel,
  colorHex,
  size = 110,
  gradient = false,
}: {
  score: number;
  label: string;
  sublabel: string;
  colorHex: string;
  size?: number;
  gradient?: boolean;
}) {
  const id = label.replace(/\s+/g, "-");
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
          role="img"
          aria-label={`${label}: ${score} out of 100`}
        >
          {gradient && (
            <defs>
              <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          )}
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EDE9FE" strokeWidth={10} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={gradient ? `url(#g-${id})` : colorHex}
            strokeWidth={10}
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
          <span
            className="text-2xl font-extrabold tabular-nums"
            style={{ color: gradient ? "#7C3AED" : colorHex }}
          >
            {score}
          </span>
          <span className="text-xs" style={{ color: "#9CA3AF" }}>/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: "#1E1B4B" }}>{label}</p>
        <p className="text-xs" style={{ color: "#6B7280" }}>{sublabel}</p>
      </div>
    </div>
  );
}

const PRIORITY_STYLE = {
  HIGH:   { bg: "rgba(239,68,68,0.08)",   text: "#EF4444", border: "rgba(239,68,68,0.2)",   dot: "#EF4444",  Icon: AlertTriangle },
  MEDIUM: { bg: "rgba(245,158,11,0.08)",  text: "#F59E0B", border: "rgba(245,158,11,0.2)",  dot: "#F59E0B",  Icon: AlertCircle  },
  LOW:    { bg: "rgba(16,185,129,0.08)",  text: "#10B981", border: "rgba(16,185,129,0.2)",  dot: "#10B981",  Icon: Info         },
};

function PriorityBadge({ priority }: { priority: string }) {
  const s = PRIORITY_STYLE[priority as keyof typeof PRIORITY_STYLE] ?? PRIORITY_STYLE.LOW;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      <s.Icon size={9} aria-hidden="true" />
      {priority}
    </span>
  );
}

function PriorityList({ items, label }: { items: PriorityItem[]; label: string }) {
  return (
    <div
      className="rounded-2xl border p-5 space-y-4 h-full"
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(124,58,237,0.1)",
      }}
    >
      <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B7280" }}>
        {label}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "#9CA3AF" }}>No items available</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => {
            const s = PRIORITY_STYLE[item.priority as keyof typeof PRIORITY_STYLE] ?? PRIORITY_STYLE.LOW;
            return (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: s.dot }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm leading-snug" style={{ color: "#374151" }}>{item.text}</p>
                  <PriorityBadge priority={item.priority} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const AGENT_META: Record<string, { label: string; Icon: React.ElementType }> = {
  hr_agent:              { label: "HR Agent",             Icon: Briefcase  },
  tech_lead_agent:       { label: "Tech Lead Agent",      Icon: Code2      },
  market_analyst_agent:  { label: "Market Analyst Agent", Icon: BarChart3  },
};

function AgentCard({
  agentKey,
  feedback,
  matchedKeywords,
}: {
  agentKey: string;
  feedback: AgentFeedback;
  matchedKeywords?: string[];
}) {
  const [open, setOpen] = useState(agentKey === "hr_agent");
  const meta = AGENT_META[agentKey] ?? { label: agentKey, Icon: Bot };
  const scoreColor = feedback.score >= 75 ? "#10B981" : feedback.score >= 50 ? "#F59E0B" : "#EF4444";
  const panelId = `agent-details-${agentKey}`;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "rgba(124,58,237,0.12)", background: "rgba(255,255,255,0.6)" }}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-600"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${meta.label} — ${open ? "collapse" : "expand"} details`}
      >
        <div className="flex items-center gap-3">
          <meta.Icon size={16} aria-hidden="true" style={{ color: "#7C3AED" }} />
          <span className="font-semibold text-sm" style={{ color: "#1E1B4B" }}>{meta.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor }}>
            {feedback.score}/100
          </span>
          {open
            ? <ChevronUp size={14} style={{ color: "#9CA3AF" }} aria-hidden="true" />
            : <ChevronDown size={14} style={{ color: "#9CA3AF" }} aria-hidden="true" />
          }
        </div>
      </button>
      {open && (
        <div
          id={panelId}
          className="px-5 pb-5 space-y-4 border-t"
          style={{ borderColor: "rgba(124,58,237,0.08)" }}
        >
          <p className="text-sm pt-3" style={{ color: "#6B7280" }}>{feedback.summary}</p>
          {feedback.details.length > 0 && (
            <ul className="space-y-1.5">
              {feedback.details.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#6B7280" }}>
                  <ChevronRight size={12} style={{ color: "#7C3AED" }} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          )}
          {agentKey === "hr_agent" && matchedKeywords && matchedKeywords.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                Matched Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {matchedKeywords.slice(0, 12).map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full px-3 py-1 text-xs font-medium border"
                    style={{
                      background: "rgba(16,185,129,0.08)",
                      color: "#10B981",
                      borderColor: "rgba(16,185,129,0.2)",
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SkillsBar({ skills }: { skills: Record<string, number> }) {
  const entries = Object.entries(skills);
  if (entries.length === 0) return null;
  return (
    <div className="space-y-3">
      {entries.map(([name, value]) => (
        <div key={name} className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span style={{ color: "#374151" }}>{name}</span>
            <span className="font-semibold tabular-nums" style={{ color: "#7C3AED" }}>{value}%</span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "#EDE9FE" }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${name} skill coverage: ${value}%`}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${value}%`,
                background: "linear-gradient(90deg, #7C3AED, #3B82F6)",
                transition: "width 0.6s cubic-bezier(0, 0, 0.2, 1)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalysisResults({ result, onReset }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (!result.analysis_id) return;
    const url = `${window.location.origin}/results/${result.analysis_id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadReport(result);
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : "Failed to generate report. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  }

  const hrScore     = result.agent_feedback.hr_agent?.score ?? 0;
  const techScore   = result.agent_feedback.tech_lead_agent?.score ?? 0;
  const marketScore = result.agent_feedback.market_analyst_agent?.score ?? 0;

  const matchLabel =
    result.overall_score >= 80 ? "Strong Match"
    : result.overall_score >= 60 ? "Good Match"
    : result.overall_score >= 40 ? "Partial Match"
    : "Needs Work";

  const matchLabelColor =
    result.overall_score >= 80 ? { bg: "rgba(16,185,129,0.1)",  text: "#10B981" }
    : result.overall_score >= 60 ? { bg: "rgba(245,158,11,0.1)", text: "#F59E0B" }
    : { bg: "rgba(239,68,68,0.1)", text: "#EF4444" };

  const qs = result.quick_stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>
          Dashboard › Analysis Results
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <h1
            className="text-3xl font-extrabold"
            style={{ fontFamily: "var(--font-jakarta)", color: "#1E1B4B" }}
          >
            Analysis Results
          </h1>
          <span
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}
          >
            <Check size={11} aria-hidden="true" /> Complete
          </span>
        </div>
        <p className="text-sm" style={{ color: "#6B7280" }}>
          Resume analyzed against the provided job description
        </p>
      </div>

      {/* Score ring cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-2xl border p-6 flex flex-col items-center gap-4 shadow-lg"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            borderColor: "rgba(124,58,237,0.2)",
          }}
        >
          <ScoreRing
            score={result.overall_score}
            label="Overall Match"
            sublabel="Combined AI score"
            colorHex="#7C3AED"
            size={130}
            gradient
          />
          <span
            className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{ background: matchLabelColor.bg, color: matchLabelColor.text }}
          >
            {matchLabel}
          </span>
        </div>

        <div
          className="rounded-2xl border p-6 flex flex-col items-center gap-4"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(124,58,237,0.1)",
          }}
        >
          <ScoreRing
            score={hrScore}
            label="ATS Score"
            sublabel={`${result.missing_keywords.length} keywords missing`}
            colorHex="#F59E0B"
            size={110}
          />
          <div className="text-center space-y-0.5">
            <p className="text-xs" style={{ color: "#6B7280" }}>Match Rate</p>
            <p className="text-lg font-bold" style={{ color: "#F59E0B" }}>{qs?.match_rate ?? 0}%</p>
          </div>
        </div>

        <div
          className="rounded-2xl border p-6 flex flex-col items-center gap-4"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(124,58,237,0.1)",
          }}
        >
          <ScoreRing
            score={techScore}
            label="Technical Fit"
            sublabel="Stack alignment"
            colorHex="#10B981"
            size={110}
          />
          <div className="text-center space-y-0.5">
            <p className="text-xs" style={{ color: "#6B7280" }}>Market Score</p>
            <p className="text-lg font-bold" style={{ color: "#10B981" }}>{marketScore}/100</p>
          </div>
        </div>
      </div>

      {/* Agent Insights */}
      <div
        className="rounded-2xl border p-6 space-y-4"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(124,58,237,0.1)",
        }}
      >
        <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B7280" }}>
          Agent Insights
        </h2>
        <div className="space-y-3">
          {Object.entries(result.agent_feedback).map(([key, feedback]) => (
            <AgentCard
              key={key}
              agentKey={key}
              feedback={feedback}
              matchedKeywords={key === "hr_agent" ? result.matched_keywords : undefined}
            />
          ))}
        </div>
      </div>

      {/* Top Strengths + Priority Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div
          className="rounded-2xl border p-5 space-y-4"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(124,58,237,0.1)",
          }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B7280" }}>
            Top Strengths
          </h2>
          {result.strengths.length === 0 ? (
            <p className="text-sm" style={{ color: "#9CA3AF" }}>No clear strengths identified for this role</p>
          ) : (
            <ul className="space-y-3">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm leading-snug" style={{ color: "#374151" }}>{s}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <PriorityList items={result.priority_improvements} label="Priority Improvements" />
      </div>

      {/* Bottom 3-col: Quick Stats | Skills Coverage | Top Action Items */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Quick Stats */}
        <div
          className="rounded-2xl border p-5 space-y-4"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(124,58,237,0.1)",
          }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B7280" }}>
            Quick Stats
          </h2>
          <dl className="space-y-3">
            {[
              { label: "Total Keywords", value: qs?.total_keywords?.toString() ?? "—" },
              { label: "Match Rate",     value: `${qs?.match_rate ?? 0}%` },
              { label: "Experience Gap", value: qs?.experience_gap ?? "—" },
              { label: "Salary Range",   value: qs?.salary_range ?? "—" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
                style={{ borderColor: "rgba(124,58,237,0.06)" }}
              >
                <dt className="text-xs" style={{ color: "#6B7280" }}>{label}</dt>
                <dd className="text-xs font-semibold" style={{ color: "#1E1B4B" }}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Skills Coverage */}
        <div
          className="rounded-2xl border p-5 space-y-4"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(124,58,237,0.1)",
          }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B7280" }}>
            Skills Coverage
          </h2>
          <SkillsBar skills={result.skills_coverage ?? {}} />
        </div>

        {/* Top Action Items */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "rgba(124,58,237,0.1)" }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)" }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-white">
              Top Action Items
            </h2>
            <button
              onClick={handleDownload}
              disabled={downloading}
              aria-busy={downloading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30 text-white hover:bg-white/20 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {downloading
                ? <><Loader2 size={11} className="animate-spin" aria-hidden="true" /> Generating…</>
                : <><Download size={11} aria-hidden="true" /> Report</>
              }
            </button>
          </div>

          <div
            className="p-5 space-y-3"
            style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)" }}
          >
            {result.action_items.length === 0 ? (
              <p className="text-sm" style={{ color: "#9CA3AF" }}>No action items available</p>
            ) : (
              <ul className="space-y-3">
                {result.action_items.slice(0, 5).map((item, i) => {
                  const s = PRIORITY_STYLE[item.priority as keyof typeof PRIORITY_STYLE] ?? PRIORITY_STYLE.LOW;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-xs leading-snug" style={{ color: "#374151" }}>{item.text}</p>
                        <PriorityBadge priority={item.priority} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-4 pt-2 flex-wrap">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
          style={{ color: "#7C3AED", borderColor: "rgba(124,58,237,0.3)" }}
        >
          <RotateCcw size={14} aria-hidden="true" /> New Analysis
        </button>

        <button
          onClick={handleDownload}
          disabled={downloading}
          aria-busy={downloading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
          style={{
            background: "linear-gradient(135deg, #7C3AED, #3B82F6)",
            boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
          }}
        >
          {downloading
            ? <><Loader2 size={14} className="animate-spin" aria-hidden="true" /> Generating PDF…</>
            : <><Download size={14} aria-hidden="true" /> Download Full Report</>
          }
        </button>

        <button
          onClick={result.analysis_id ? handleShare : undefined}
          disabled={!result.analysis_id}
          aria-disabled={!result.analysis_id}
          title={!result.analysis_id ? "Sharing unavailable — result was not saved" : undefined}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-colors hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          style={{ color: "#10B981", borderColor: "rgba(16,185,129,0.3)" }}
        >
          <Share2 size={14} aria-hidden="true" />
          {copied ? "Link Copied!" : "Share Results"}
        </button>
      </div>

      {/* Download error */}
      {downloadError && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <AlertCircle size={16} aria-hidden="true" />
          <span>{downloadError}</span>
          <button
            onClick={handleDownload}
            className="ml-auto text-xs font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
