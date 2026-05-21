# Goals

## Vision

A "virtual interview panel" SaaS that gives any job seeker instant, expert-level feedback on their resume vs. a specific job description.

## Primary Goal

Accept a PDF resume + job description → return structured, actionable analysis (ATS score, missing keywords, strengths, per-agent feedback).

## Secondary Goals

- PII sanitization before any data hits the AI layer
- Downloadable PDF report of analysis results
- Beautiful, real-time UI that simulates agent progress

## Non-Goals

- Resume editing / rewriting (v1)
- Recruiter-side tooling (v1)
- Multi-language support (v1)

## Success Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Analysis turnaround | < 30s | End-to-end from upload |
| JSON schema compliance | 100% | Enforced by Pydantic |
| PII leakage | 0 | Regex + light agent sanitization |
