# Project Name: AI-Driven Resume & Job Match Analyzer (SaaS)
**Role:** You are a Senior Full-Stack AI Developer and Software Architect. 
**Context:** This document contains the 100% full overview of the project. Read and understand the entire architecture, but DO NOT build everything at once. We will execute this strictly chapter by chapter.

## 1. Product Overview
A system that acts as a multi-agent "virtual interview panel". It accepts a user's PDF resume and a job description, sanitizes PII (Personally Identifiable Information), parses the data, runs an analysis using a LangGraph-based multi-agent system, and returns a highly structured, actionable JSON response.

## 2. Tech Stack & Infrastructure
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, `stitch` (for UI components).
- **Backend:** Python, FastAPI.
- **Database & Auth:** Supabase (PostgreSQL + pgvector).
- **AI/LLM Engine:** Groq (Llama 3.3).
- **Agent Orchestration:** LangGraph (Stateful workflow).
- **Document Parsing:** LlamaParse (or unstructured.io) for multi-column PDFs.
- **Export:** FPDF (Python) for generating downloadable PDF reports.

## 3. Architecture & Data Flow
1. **Input:** Next.js frontend uploads a PDF and a job description string to FastAPI (`POST /api/v1/analyze-resume`).
2. **Sanitization:** Backend intercepts text and strips sensitive PII (emails, phone numbers).
3. **Orchestration (LangGraph):** Supervisor agent delegates to three sub-agents:
   - **HR Agent:** ATS matching (years of experience, keywords).
   - **Tech Lead Agent:** Deep analysis of technical projects.
   - **Market Analyst Agent:** Uses web search tools (Tavily/DuckDuckGo) for current market trends.
4. **Output:** Backend strictly enforces a Pydantic JSON schema returning: overall score, missing keywords, strengths, and actionable feedback grouped by agent.

## 4. Execution Rules (CRITICAL)
You now have the full context. However, you must follow this strict step-by-step execution plan. 
**Rule:** After completing a chapter, you MUST STOP and wait for my explicit command ("PROCEED") before moving to the next chapter.

### Chapter 1: Foundation & Scaffolding
- Initialize the Next.js frontend (TypeScript, Tailwind, `stitch`).
- Initialize the Python FastAPI backend (requirements.txt, basic structure).
- Create a simple `GET /health` endpoint and connect the frontend to test the bridge.

### Chapter 2: Data Ingestion & Security
- Build the FastAPI endpoint to accept PDF uploads.
- Implement PDF parsing (LlamaParse/unstructured) and the PII sanitization logic (Regex/light agent).

### Chapter 3: The AI Brain (LangGraph)
- Set up LangGraph and connect to the Groq API.
- Create the 3 specific agents with their respective prompts and tools.
- Enforce the Pydantic JSON output structure.

### Chapter 4: Frontend UI & UX
- Build the file upload dashboard.
- Implement loading states (simulating agent progress).
- Render the JSON response into beautiful `stitch` components.

### Chapter 5: Polish & Export
- Add the PDF report generation logic in the backend.
- Connect the frontend "Download Report" functionality.

---
**Initial Prompt for Claude Code/Cursor:**
"I have read and understood the entire project overview. I am ready to begin Chapter 1: Foundation & Scaffolding. Please confirm when you want me to write the code for Chapter 1."