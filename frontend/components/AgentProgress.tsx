"use client";

import { useEffect, useState } from "react";
import { BarChart3, Bot, Briefcase, Check, Clock, Code2, Lightbulb, Loader2 } from "lucide-react";
import type { AnalysisStage } from "@/types/analysis";

interface Props {
  stage: AnalysisStage;
}

const STEPS = [
  {
    key: "hr_agent" as AnalysisStage,
    label: "HR Compliance Agent",
    activeText: "Scanning ATS keywords and experience requirements...",
    doneText: "ATS keyword scan complete — keywords identified",
    Icon: Briefcase,
  },
  {
    key: "tech_agent" as AnalysisStage,
    label: "Tech Lead Agent",
    activeText: "Evaluating technical project depth and stack match...",
    doneText: "Technical depth analysis complete",
    Icon: Code2,
  },
  {
    key: "market_agent" as AnalysisStage,
    label: "Market Analyst Agent",
    activeText: "Researching live market trends and salary data...",
    doneText: "Market analysis complete",
    Icon: BarChart3,
  },
];

const ORDER: AnalysisStage[] = ["hr_agent", "tech_agent", "market_agent", "done"];

function stepStatus(stepKey: AnalysisStage, current: AnalysisStage) {
  const stepIdx = ORDER.indexOf(stepKey);
  const curIdx = ORDER.indexOf(current);
  if (curIdx > stepIdx) return "done";
  if (curIdx === stepIdx) return "active";
  return "waiting";
}

export default function AgentProgress({ stage }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const completedCount = Math.max(0, ORDER.indexOf(stage));
  const overallPct = Math.round((completedCount / 3) * 100);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center py-8 gap-5">
      <h1 className="sr-only">Analyzing your resume — please wait</h1>

      {/* Main card */}
      <div
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(124,58,237,0.15)",
        }}
      >
        {/* Top */}
        <div className="px-8 pt-8 pb-6 text-center space-y-3">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" aria-hidden="true" />
            Analysis in Progress
          </span>

          {/* Orb — single animate-ping, no stacked pulses */}
          <div className="flex items-center justify-center py-3" aria-hidden="true">
            <div className="relative w-20 h-20">
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)" }}
              />
              <div
                className="absolute inset-4 rounded-full flex items-center justify-center text-white"
                style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)" }}
              >
                <Bot size={24} />
              </div>
            </div>
          </div>

          <h2
            className="text-2xl font-extrabold"
            style={{ fontFamily: "var(--font-jakarta)", color: "#1E1B4B" }}
          >
            Your Agents Are Working...
          </h2>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            3 specialized AI agents are reviewing your resume against the job description.
          </p>
          <p className="text-xs tabular-nums" style={{ color: "#9CA3AF" }}>
            Analyzing for {mm}:{ss}
          </p>
        </div>

        {/* Agent rows */}
        <div className="px-6 space-y-3 pb-5">
          {STEPS.map((step) => {
            const status = stepStatus(step.key, stage);
            const pct = status === "done" ? 100 : status === "active" ? 62 : 0;

            return (
              <div
                key={step.key}
                className="rounded-xl border p-4 transition-all"
                style={{
                  background:
                    status === "active"
                      ? "rgba(124,58,237,0.05)"
                      : status === "done"
                      ? "rgba(16,185,129,0.04)"
                      : "rgba(248,248,252,0.5)",
                  borderColor:
                    status === "active"
                      ? "rgba(124,58,237,0.3)"
                      : status === "done"
                      ? "rgba(16,185,129,0.25)"
                      : "rgba(124,58,237,0.07)",
                }}
              >
                <div className="flex items-start gap-3 mb-2">
                  <step.Icon
                    size={18}
                    className="mt-0.5 flex-shrink-0"
                    style={{
                      color: status === "done" ? "#10B981" : status === "active" ? "#7C3AED" : "#9CA3AF",
                    }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold" style={{ color: "#1E1B4B" }}>
                        {step.label}
                      </span>
                      {status === "done" && (
                        <span
                          className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}
                        >
                          <Check size={10} aria-hidden="true" /> Complete
                        </span>
                      )}
                      {status === "active" && (
                        <span
                          className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}
                        >
                          <Loader2 size={10} className="animate-spin" aria-hidden="true" /> In Progress
                        </span>
                      )}
                      {status === "waiting" && (
                        <span
                          className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "rgba(107,114,128,0.08)", color: "#9CA3AF" }}
                        >
                          <Clock size={10} aria-hidden="true" /> Queued
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#6B7280" }}>
                      {status === "done"
                        ? step.doneText
                        : status === "active"
                        ? step.activeText
                        : "Waiting for previous agent to complete..."}
                    </p>
                  </div>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "#EDE9FE" }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${step.label} progress`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${pct}%`,
                      background: status === "done" ? "#10B981" : "linear-gradient(90deg, #7C3AED, #3B82F6)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall progress */}
        <div className="px-6 pb-7 space-y-2">
          <div className="flex items-center justify-between text-xs" style={{ color: "#6B7280" }}>
            <span>Overall Progress</span>
            <span>{completedCount} of 3 complete</span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "#EDE9FE" }}
            role="progressbar"
            aria-valuenow={overallPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall analysis progress"
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${overallPct}%`,
                background: "linear-gradient(90deg, #7C3AED, #3B82F6)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tip card */}
      <div
        className="w-full max-w-xl rounded-xl border px-5 py-3.5"
        style={{
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(8px)",
          borderColor: "rgba(124,58,237,0.1)",
        }}
      >
        <p className="text-xs flex items-start gap-2" style={{ color: "#6B7280" }}>
          <Lightbulb size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#7C3AED" }} aria-hidden="true" />
          <span><strong>Did you know?</strong> ATS systems reject up to 75% of resumes before a human ever sees them.</span>
        </p>
      </div>
    </div>
  );
}
