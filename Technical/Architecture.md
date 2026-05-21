# Architecture

## Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS | UI components via `stitch` |
| Backend | Python, FastAPI | REST API |
| Database & Auth | Supabase (PostgreSQL + pgvector) | |
| AI/LLM Engine | Groq (Llama 3.3) | |
| Agent Orchestration | LangGraph | Stateful workflow |
| Document Parsing | LlamaParse (or unstructured.io) | Multi-column PDF support |
| Web Search Tools | Tavily / DuckDuckGo | Used by Market Analyst Agent |
| Export | FPDF (Python) | Downloadable PDF reports |

## Data Flow

```
User (browser)
  │
  │  PDF + job description string
  ▼
Next.js Frontend
  │
  │  POST /api/v1/analyze-resume
  ▼
FastAPI Backend
  │
  ├─ PDF Parsing (LlamaParse / unstructured.io)
  ├─ PII Sanitization (Regex / light agent)
  │
  ▼
LangGraph Supervisor Agent
  ├─ HR Agent          → ATS matching, keywords, years of experience
  ├─ Tech Lead Agent   → Deep technical project analysis
  └─ Market Analyst    → Web search (Tavily/DuckDuckGo) for market trends
  │
  ▼
Pydantic JSON Schema Enforcement
  │
  ▼
Response: { overall_score, missing_keywords, strengths, agent_feedback }
  │
  ▼
Frontend renders results + "Download Report" → FPDF PDF export
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/analyze-resume` | Main analysis endpoint |

## Output Schema (Pydantic enforced)

```json
{
  "overall_score": 0-100,
  "missing_keywords": ["..."],
  "strengths": ["..."],
  "agent_feedback": {
    "hr_agent": { ... },
    "tech_lead_agent": { ... },
    "market_analyst_agent": { ... }
  }
}
```
