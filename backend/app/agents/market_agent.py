import os

from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel, Field

from .state import AnalysisState

_MODEL = "llama-3.3-70b-versatile"

_SEARCH_PROMPT = """You are a market research analyst specializing in tech hiring trends.
Search for current market demand, salary trends, and in-demand skills for the role described.
Do 2-3 targeted searches, then stop and summarize your findings."""

_SYNTHESIS_SYSTEM = """You are a market analyst. Based on the research findings provided,
analyze the candidate's market fit and return:
- market_fit_score: how well the candidate aligns with current market demand (0-100)
- trending_skills_missing: in-demand skills the candidate lacks
- market_insights: 3-5 key market observations relevant to this candidate
- demand_level: overall market demand for this role (Low / Medium / High / Very High)
- summary: a concise 2-3 sentence market fit assessment"""


class MarketResult(BaseModel):
    market_fit_score: int = Field(..., ge=0, le=100)
    trending_skills_missing: list[str]
    market_insights: list[str]
    demand_level: str
    summary: str


def _get_tools() -> list:
    if os.getenv("TAVILY_API_KEY"):
        from langchain_community.tools.tavily_search import TavilySearchResults
        return [TavilySearchResults(max_results=3)]
    return [DuckDuckGoSearchRun()]


def market_agent_node(state: AnalysisState) -> dict:
    llm = ChatGroq(model=_MODEL, temperature=0)
    tools = _get_tools()

    react_agent = create_react_agent(llm, tools)

    # Extract role title from JD for focused search
    jd_excerpt = state["job_description"][:400]
    resume_excerpt = state["resume_text"][:600]

    research = react_agent.invoke({
        "messages": [
            SystemMessage(content=_SEARCH_PROMPT),
            HumanMessage(
                content=f"Research current market demand and top required skills for this role:\n{jd_excerpt}"
            ),
        ]
    })

    findings = research["messages"][-1].content

    result: MarketResult = llm.with_structured_output(MarketResult).invoke([
        SystemMessage(content=_SYNTHESIS_SYSTEM),
        HumanMessage(
            content=f"MARKET RESEARCH FINDINGS:\n{findings}\n\nCANDIDATE RESUME EXCERPT:\n{resume_excerpt}"
        ),
    ])
    return {"market_result": result.model_dump()}
