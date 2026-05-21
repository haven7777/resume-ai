"use client";

import { useRef, useState } from "react";

interface Props {
  onSubmit: (file: File, jobDescription: string) => void;
  disabled?: boolean;
}

export default function UploadForm({ onSubmit, disabled }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  };

  const canSubmit = !!(file && jobDescription.trim().length >= 10 && !disabled);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="text-center space-y-4">
        <span
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border"
          style={{
            color: "#7C3AED",
            background: "rgba(124,58,237,0.08)",
            borderColor: "rgba(124,58,237,0.2)",
          }}
        >
          ✦ AI-Powered Analysis
        </span>
        <h1
          className="text-4xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-jakarta)", color: "#1E1B4B" }}
        >
          Analyze Your Resume
        </h1>
        <p className="text-base max-w-lg mx-auto" style={{ color: "#6B7280" }}>
          Get matched against any job description by 3 specialized AI agents in under 30 seconds.
        </p>
      </div>

      {/* Two-column glass card */}
      <div
        className="rounded-2xl border shadow-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(124,58,237,0.12)",
        }}
      >
        {/* Left: Resume upload */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#1E1B4B" }}>
            <span>📄</span> Your Resume
          </label>

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all min-h-[200px]"
            style={{
              borderColor: dragging ? "#7C3AED" : file ? "#10B981" : "#DDD6FE",
              background: dragging
                ? "rgba(124,58,237,0.05)"
                : file
                ? "rgba(16,185,129,0.04)"
                : "rgba(245,243,255,0.6)",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="text-4xl">✅</div>
                <p className="font-semibold text-sm" style={{ color: "#10B981" }}>{file.name}</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>{(file.size / 1024).toFixed(0)} KB</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-2 text-xs px-3 py-1 rounded-full border transition-colors hover:bg-red-50"
                  style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.3)" }}
                >
                  Remove ×
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-1"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.15))" }}
                >
                  ☁️
                </div>
                <p className="font-semibold text-sm" style={{ color: "#1E1B4B" }}>Drag & drop your PDF here</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>or click to browse — PDF only, max 10MB</p>
              </div>
            )}
          </div>
          <p className="text-xs" style={{ color: "#9CA3AF" }}>
            Only PDF files are supported. Your PII will be automatically redacted.
          </p>
        </div>

        {/* Right: Job description */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#1E1B4B" }}>
            <span>💼</span> Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here... Include the role title, required skills, and responsibilities for the best results."
            rows={9}
            maxLength={10000}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.9)",
              border: "1.5px solid #DDD6FE",
              color: "#1E1B4B",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#7C3AED";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#DDD6FE";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <p className="text-xs text-right" style={{ color: "#9CA3AF" }}>
            {jobDescription.length} / 10,000
          </p>
        </div>
      </div>

      {/* Analyze CTA */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => { if (canSubmit) onSubmit(file!, jobDescription); }}
          disabled={!canSubmit}
          className="px-10 py-3.5 rounded-full font-bold text-base transition-all"
          style={{
            background: canSubmit ? "linear-gradient(135deg, #7C3AED, #3B82F6)" : "#E5E7EB",
            color: canSubmit ? "white" : "#9CA3AF",
            cursor: canSubmit ? "pointer" : "not-allowed",
            boxShadow: canSubmit ? "0 8px 24px rgba(124,58,237,0.35)" : "none",
          }}
        >
          ✦ Analyze My Resume
        </button>
        <p className="text-xs" style={{ color: "#9CA3AF" }}>
          🔒 Your data is processed securely and never stored permanently
        </p>
      </div>

      {/* Mini timeline */}
      <div className="flex items-center justify-center">
        {[
          { num: "1", label: "PII Sanitized" },
          { num: "2", label: "3 Agents Analyze" },
          { num: "3", label: "Report Generated" },
        ].map((step, i) => (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)" }}
              >
                {step.num}
              </div>
              <span className="text-xs whitespace-nowrap" style={{ color: "#6B7280" }}>{step.label}</span>
            </div>
            {i < 2 && (
              <div
                className="w-16 h-0.5 mb-4 mx-1"
                style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
