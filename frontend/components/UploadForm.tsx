"use client";

import { useRef, useState } from "react";
import { Briefcase, CheckCircle2, FileText, Lock, Upload } from "lucide-react";

interface Props {
  onSubmit: (file: File, jobDescription: string) => void;
  disabled?: boolean;
}

export default function UploadForm({ onSubmit, disabled }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState({ file: false, jd: false });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setTouched((t) => ({ ...t, file: true }));
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  };

  const canSubmit = !!(file && jobDescription.trim().length >= 10 && !disabled);

  const fileError = touched.file && !file ? "Please upload a PDF resume." : null;
  const jdError = touched.jd && jobDescription.trim().length < 10
    ? "Job description must be at least 10 characters."
    : null;

  function handleSubmitAttempt(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ file: true, jd: true });
    if (canSubmit) onSubmit(file!, jobDescription);
  }

  return (
    <form onSubmit={handleSubmitAttempt} noValidate className="space-y-8">
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
          <label
            id="resume-label"
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: "#1E1B4B" }}
          >
            <FileText size={14} aria-hidden="true" />
            Your Resume
            <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>
          </label>

          <div
            role="button"
            tabIndex={0}
            aria-labelledby="resume-label"
            aria-describedby={fileError ? "file-error" : undefined}
            aria-required="true"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all min-h-[200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
            style={{
              borderColor: fileError
                ? "#EF4444"
                : dragging
                ? "#7C3AED"
                : file
                ? "#10B981"
                : "#DDD6FE",
              background: dragging
                ? "rgba(124,58,237,0.05)"
                : file
                ? "rgba(16,185,129,0.04)"
                : "rgba(245,243,255,0.6)",
            }}
          >
            <input
              ref={inputRef}
              id="resume-file-input"
              type="file"
              accept="application/pdf"
              aria-required="true"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setTouched((t) => ({ ...t, file: true }));
              }}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <CheckCircle2 size={36} className="text-emerald-500" aria-hidden="true" />
                <p className="font-semibold text-sm" style={{ color: "#10B981" }}>{file.name}</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>{(file.size / 1024).toFixed(0)} KB</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-2 text-xs px-3 py-1 rounded-full border transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.3)" }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.15))" }}
                >
                  <Upload size={28} style={{ color: "#7C3AED" }} aria-hidden="true" />
                </div>
                <p className="font-semibold text-sm" style={{ color: "#1E1B4B" }}>Drag & drop your PDF here</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>or click to browse — PDF only, max 10MB</p>
              </div>
            )}
          </div>

          {fileError && (
            <p id="file-error" role="alert" className="text-xs flex items-center gap-1" style={{ color: "#EF4444" }}>
              <span aria-hidden="true">⚠</span> {fileError}
            </p>
          )}

          <p className="text-xs" style={{ color: "#9CA3AF" }}>
            Only PDF files are supported. Your PII will be automatically redacted.
          </p>
        </div>

        {/* Right: Job description */}
        <div className="space-y-3">
          <label
            htmlFor="job-description"
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: "#1E1B4B" }}
          >
            <Briefcase size={14} aria-hidden="true" />
            Job Description
            <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, jd: true }))}
            placeholder="Paste the full job description here... Include the role title, required skills, and responsibilities for the best results."
            rows={9}
            maxLength={10000}
            aria-required="true"
            aria-describedby="jd-counter jd-error"
            aria-invalid={jdError ? "true" : undefined}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-1"
            style={{
              background: "rgba(255,255,255,0.9)",
              border: jdError ? "1.5px solid #EF4444" : "1.5px solid #DDD6FE",
              color: "#1E1B4B",
            }}
          />
          {jdError && (
            <p id="jd-error" role="alert" className="text-xs flex items-center gap-1" style={{ color: "#EF4444" }}>
              <span aria-hidden="true">⚠</span> {jdError}
            </p>
          )}
          <p id="jd-counter" className="text-xs text-right" style={{ color: "#9CA3AF" }}>
            {jobDescription.length} / 10,000
          </p>
        </div>
      </div>

      {/* Analyze CTA */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="submit"
          disabled={disabled}
          aria-disabled={disabled || (!canSubmit && touched.file && touched.jd)}
          className="px-10 py-3.5 rounded-full font-bold text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
          style={{
            background: canSubmit ? "linear-gradient(135deg, #7C3AED, #3B82F6)" : "#E5E7EB",
            color: canSubmit ? "white" : "#9CA3AF",
            cursor: canSubmit ? "pointer" : "not-allowed",
            boxShadow: canSubmit ? "0 8px 24px rgba(124,58,237,0.35)" : "none",
          }}
        >
          ✦ Analyze My Resume
        </button>
        <p className="text-xs flex items-center gap-1" style={{ color: "#9CA3AF" }}>
          <Lock size={11} aria-hidden="true" />
          Your data is processed securely and never stored permanently
        </p>
      </div>

      {/* Mini timeline */}
      <div className="flex items-center justify-center" aria-hidden="true">
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
    </form>
  );
}
