from datetime import datetime
from io import BytesIO

from fpdf import FPDF

from app.schemas.response import AnalysisResult

_AGENT_LABELS = {
    "hr_agent": ("HR Agent", "ATS & Experience"),
    "tech_lead_agent": ("Tech Lead Agent", "Technical Depth"),
    "market_analyst_agent": ("Market Analyst", "Market Fit"),
}

_SCORE_COLOR = {
    "high": (34, 197, 94),    # green
    "mid":  (234, 179, 8),    # yellow
    "low":  (239, 68, 68),    # red
}


def _score_tier(score: int) -> str:
    if score >= 75:
        return "high"
    if score >= 50:
        return "mid"
    return "low"


class ResumeReport(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, "Resume AI Analyzer - Confidential", align="L")
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, datetime.now().strftime("%B %d, %Y"), align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(50, 50, 50)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def section_title(self, title: str):
        self.ln(4)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(200, 200, 200)
        self.set_fill_color(30, 30, 40)
        self.cell(0, 8, f"  {title}", fill=True, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def score_badge(self, score: int, label: str):
        tier = _score_tier(score)
        r, g, b = _SCORE_COLOR[tier]
        self.set_font("Helvetica", "B", 36)
        self.set_text_color(r, g, b)
        self.cell(0, 18, str(score), align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 10)
        self.set_text_color(160, 160, 160)
        self.cell(0, 6, label, align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def tag_row(self, items: list[str], bg: tuple[int, int, int], fg: tuple[int, int, int]):
        self.set_font("Helvetica", "", 9)
        self.set_fill_color(*bg)
        self.set_text_color(*fg)
        x0 = self.get_x()
        for item in items:
            w = self.get_string_width(item) + 8
            if self.get_x() + w > self.w - self.r_margin:
                self.ln(7)
                self.set_x(x0)
            self.cell(w, 6, item, fill=True, border=0)
            self.set_x(self.get_x() + 2)
        self.ln(8)
        self.set_text_color(220, 220, 220)

    def agent_block(self, key: str, feedback):
        label, subtitle = _AGENT_LABELS.get(key, (key, ""))
        tier = _score_tier(feedback.score)
        r, g, b = _SCORE_COLOR[tier]

        # Agent name + score on same line
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(220, 220, 220)
        self.cell(130, 7, f"{label} - {subtitle}")
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(r, g, b)
        self.cell(0, 7, str(feedback.score), align="R", new_x="LMARGIN", new_y="NEXT")

        # Summary
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(160, 160, 160)
        self.multi_cell(0, 5, feedback.summary)
        self.ln(1)

        # Details
        self.set_font("Helvetica", "", 9)
        self.set_text_color(190, 190, 190)
        text_w = self.w - self.l_margin - self.r_margin - 6
        for detail in feedback.details:
            self.set_x(self.l_margin)
            self.cell(6, 5, "-")
            self.multi_cell(text_w, 5, detail)
        self.ln(3)


def generate_report(result: AnalysisResult) -> bytes:
    pdf = ResumeReport(orientation="P", unit="mm", format="A4")
    pdf.set_margins(18, 18, 18)
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_fill_color(15, 15, 20)
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(240, 240, 255)
    pdf.cell(0, 12, "Resume Analysis Report", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    # Overall score
    pdf.score_badge(result.overall_score, "Overall Match Score  (HR 40% / Tech 40% / Market 20%)")

    # Strengths
    pdf.section_title("Strengths")
    if result.strengths:
        pdf.tag_row(result.strengths, bg=(20, 60, 35), fg=(134, 239, 172))
    else:
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(120, 120, 120)
        pdf.cell(0, 6, "None identified.", new_x="LMARGIN", new_y="NEXT")

    # Missing keywords
    pdf.section_title("Missing Keywords")
    if result.missing_keywords:
        pdf.tag_row(result.missing_keywords, bg=(60, 20, 20), fg=(252, 165, 165))
    else:
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(120, 120, 120)
        pdf.cell(0, 6, "No critical gaps found.", new_x="LMARGIN", new_y="NEXT")

    # Agent feedback
    pdf.section_title("Agent Feedback")
    for key, feedback in result.agent_feedback.items():
        pdf.agent_block(key, feedback)

    buf = BytesIO()
    pdf.output(buf)
    return buf.getvalue()
