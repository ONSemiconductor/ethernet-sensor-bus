"""Sphinx configuration of the ESB documentation.

docs/build.py generates the pages (Markdown) with protoc-gen-hikaripb and runs sphinx-build with this folder as the
configuration directory, so that the paths below are relative to it.
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent

project = "ESB Protocol"
extensions = ["myst_parser", "sphinxcontrib.rsvgconverter"]
repository_url = "https://github.com/ONSemiconductor/ethernet-sensor-bus"
# on the title page of the PDF
document_id = "ESB"
version_id = "1.0.0"

# -- HTML ----------------------------------------------------------------------------------------------------------------
html_theme = "sphinx_rtd_theme"
html_theme_options = {"logo_only": True, "prev_next_buttons_location": None}
html_logo = "../figures/logoEsbLight.svg"
html_favicon = "static/favicon.png"
# the dark logo is a single file, which esb.css shows in the dark color scheme
html_static_path = ["static", "../figures/logoEsbDark.svg"]
html_css_files = ["colors.css", "esb.css"]
html_show_copyright = False
html_show_sphinx = False
html_show_sourcelink = False
html_copy_source = False
# templates/versions.html is the link to the repository at the bottom of the side bar
templates_path = ["templates"]
html_context = {"repository_url": repository_url}

# -- PDF -----------------------------------------------------------------------------------------------------------------
# docs/build.py makes the book (root_doc) and runs xelatex. The design is in docs/latex: the title page (title.tex) with the logo
# (Logo.pdf), the page styles (preamble.tex), and the background of the title page (UserGuide_Cover.pdf).
latex_engine = "xelatex"
latex_documents = [("book", "esb-specification.tex", project, "Ethernet Sensor Bus", "manual")]
latex_table_style = ["standard"]
latex_additional_files = ["latex/UserGuide_Cover.pdf", "latex/Logo.pdf"]


def _tex(name: str) -> str:
    return (HERE / "latex" / name).read_text(encoding="utf-8")


latex_elements = {
    "papersize": "a4paper",
    "maketitle": _tex("title.tex"),
    "preamble": "\\newcommand{\\esbtitle}{%s}\n\\newcommand{\\documentid}{%s}\n\\newcommand{\\versionid}{%s}\n%s"
    % (project, document_id, version_id, _tex("preamble.tex")),
    "figure_align": "H",  # a figure stays where the text puts it
    "fontpkg": "",  # the fonts are chosen in preamble.tex
    "makeindex": "",
    "printindex": "",
    "sphinxsetup": ",".join(
        (
            "verbatimwithframe=false",
            "VerbatimColor={HTML}{F8F9FA}",
            "InnerLinkColor={HTML}{000000}",
            "OuterLinkColor={HTML}{000000}",
            "TitleColor={HTML}{1D3546}",
            "warningBgColor={HTML}{FFC63F}",
            "warningborder=0pt",
            "HeaderFamily=\\rmfamily\\bfseries",
            "verbatimvisiblespace=",
            "verbatimcontinued=",
        )
    ),
}
