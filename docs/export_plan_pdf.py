"""Convert Incident_Handoff_Build_Plan.md to PDF (no Chromium required)."""
from __future__ import annotations

import re
from pathlib import Path

from fpdf import FPDF

MD_FILE = Path(__file__).with_name("Incident_Handoff_Build_Plan.md")
PDF_FILE = Path(__file__).with_name("Incident_Handoff_Build_Plan.pdf")


def to_latin1_safe(text: str) -> str:
    text = (
        text.replace("\u2014", "-")
        .replace("\u2013", "-")
        .replace("\u2026", "...")
        .replace("\u2192", "->")
    )
    return text.encode("latin-1", "replace").decode("latin-1")


class Doc(FPDF):
    def __init__(self) -> None:
        super().__init__()
        self.set_auto_page_break(auto=True, margin=18)


def main() -> None:
    raw = MD_FILE.read_text(encoding="utf-8")
    lines = raw.splitlines()

    pdf = Doc()
    pdf.add_page()
    in_code = False

    for line in lines:
        if line.strip().startswith("```"):
            in_code = not in_code
            pdf.ln(2)
            continue
        if in_code:
            pdf.set_font("Courier", size=8)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(pdf.epw, 4, to_latin1_safe(line) if line else " ")
            continue

        s = line.rstrip()
        if not s:
            pdf.ln(3)
            continue

        w = pdf.epw
        if s.startswith("# "):
            pdf.set_font("Helvetica", "B", 16)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(w, 8, to_latin1_safe(s[2:]))
            pdf.ln(2)
        elif s.startswith("## "):
            pdf.set_font("Helvetica", "B", 13)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(w, 7, to_latin1_safe(s[3:]))
            pdf.ln(1)
        elif s.startswith("### "):
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(w, 6, to_latin1_safe(s[4:]))
            pdf.ln(1)
        elif re.match(r"^[-*] ", s):
            pdf.set_font("Helvetica", size=10)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(w, 5, to_latin1_safe("  " + s))
        else:
            pdf.set_font("Helvetica", size=10)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(w, 5, to_latin1_safe(s))

    pdf.output(PDF_FILE.as_posix())
    print(f"Wrote {PDF_FILE}")


if __name__ == "__main__":
    main()
