# PRD

> **Status:** Planning
> **Last Updated:** 2026-05-21

---

## Quick Links

### Product
- [[Product/Goals|Goals]] — What we're building and why
- [[Product/Requirements|Requirements]] — Functional & non-functional specs
- [[Product/Features/_Index|Features]] — Feature breakdown
- [[Product/Decisions/_Index|Product Decisions]] — Key product choices & rationale
- [[Product/Open Questions|Open Questions]] — Unresolved questions

### Technical
- [[Technical/Architecture|Architecture]] — System design & stack
- [[Technical/Tasks/_Index|Tasks]] — Work items & status
- [[Technical/Bugs/_Index|Bugs]] — Known issues
- [[Technical/Decisions/_Index|Technical Decisions]] — ADRs

### Context
- [[Context/Session Log|Session Log]] — Running log of work sessions & decisions

---

## Summary

An AI-driven Resume & Job Match Analyzer SaaS. Users upload a PDF resume + job description; a LangGraph multi-agent system (HR Agent, Tech Lead Agent, Market Analyst Agent) analyzes the match and returns structured, actionable feedback as JSON — and a downloadable PDF report.

## Core Problem

Job seekers don't know why their resume fails ATS systems or how to tailor it to specific roles. Recruiters need fast signal on candidate fit.

## Target Users

Job seekers applying to technical roles who want actionable, AI-powered feedback on resume-to-job-description fit.
