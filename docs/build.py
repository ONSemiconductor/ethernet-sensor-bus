#!/usr/bin/env python3
"""Build the documentation of ESB: the HTML pages of the protocol and the PDF of it.

Usage: python docs/build.py --hikaripb <checkout of protoc-plugin-hikaripb> [--output generated/html] [--strict]
                            [--no-pdf]

protoc-gen-hikaripb (type=sphinxdocs) turns the comments of the .proto files and the Markdown files of introduction
into the sources of a Sphinx project, and sphinx-build makes the pages of them (generated/docs-src -> --output). The
configuration of Sphinx is docs/conf.py, the home page is docs/home.md.

The PDF is built from a second project, because the chapters of a book follow the nesting of the pages: with the option
inline_protocol the messages of a file are a section of its chapter (generated/pdf-src). Sphinx makes the LaTeX
sources of it (generated/latex), xelatex the PDF, which is copied next to the pages (--output/esb-specification.pdf),
where the home page links to it. The design of the PDF (cover page, title page, header and footer) is in
docs/latex.

With --strict, a message of the plugin, a warning of Sphinx or a character that the fonts lack fails the build.

Needs protoc (or the program in $PROTOC), the Python packages of docs/requirements.txt and the ones of the plugin
(protoc/requirements.txt in its checkout). The PDF also needs xelatex and rsvg-convert, which converts the SVG figures.
"""
import argparse
import os
import re
import shutil
import stat
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
GENERATED = ROOT / "generated"
TITLE = "ESB Protocol"
PDF = "esb-specification.pdf"
TOCTREE = re.compile(r"^```\{toctree\}\n(?::[^\n]*\n)*\n(?P<entries>.*?)^```$", re.MULTILINE | re.DOTALL)


def plugin_wrapper(plugin: Path) -> Path:
    """The program that protoc starts as the plugin: hikaripb.py is a script, which protoc cannot start by itself."""
    if os.name == "nt":
        return plugin.with_name("protoc-gen-hikaripb.bat")
    wrapper = GENERATED / "protoc-gen-hikaripb"
    wrapper.write_text('#!/bin/sh\nexec "%s" "%s" "$@"\n' % (sys.executable, plugin), encoding="utf-8")
    wrapper.chmod(wrapper.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    return wrapper


def generate(hikaripb: Path, sources: Path, strict: bool, book: bool) -> None:
    """The sources of a Sphinx project: protoc runs in protocol, where the imports and the pages are found."""
    plugin = hikaripb / "protoc" / "hikaripb.py"
    if not plugin.is_file():
        sys.exit("%s not found: --hikaripb names a checkout of protoc-plugin-hikaripb" % plugin)
    protoc = os.environ.get("PROTOC", "protoc")
    if shutil.which(protoc) is None:
        sys.exit("protoc not found: install it or set PROTOC")

    protocol = ROOT / "protocol"
    shutil.rmtree(sources, ignore_errors=True)
    sources.mkdir(parents=True)
    GENERATED.mkdir(exist_ok=True)
    protos = sorted(path.relative_to(protocol).as_posix() for path in protocol.rglob("*.proto"))
    # The comments name images as ../figures/..., relative to protocol; image_path is relative to the sources.
    image_path = os.path.relpath(protocol, sources).replace(os.sep, "/")
    options = ["type=sphinxdocs", "omit_conf", "title=" + TITLE.replace(" ", "+"), "image_path=" + image_path,
               "pages=../introduction"]
    # A book has no home page: its first chapter is the overview of the introduction.
    options.append("inline_protocol" if book else "home=../docs/home.md")
    command = [protoc, "--experimental_allow_proto3_optional",
               "--plugin=protoc-gen-hikaripb=" + str(plugin_wrapper(plugin)), "--proto_path=.",
               "--hikaripb_out=%s:%s" % (",".join(options), sources), *protos]
    result = subprocess.run(command, cwd=protocol, env={**os.environ, "PYTHON": sys.executable},
                            capture_output=True, text=True, encoding="utf-8")
    sys.stderr.write(result.stderr)
    if result.returncode != 0 or (strict and result.stderr.strip()):
        sys.exit("protoc-gen-hikaripb failed")


def sphinx(builder: str, sources: Path, output: Path, strict: bool, *definitions: str) -> None:
    shutil.rmtree(output, ignore_errors=True)
    command = [sys.executable, "-m", "sphinx", "-b", builder, "-c", str(DOCS), "-q",
               *(["-W", "--keep-going"] if strict else []), *(arg for item in definitions for arg in ("-D", item)),
               str(sources), str(output)]
    if subprocess.run(command).returncode != 0:
        sys.exit("sphinx-build (%s) failed" % builder)


def make_book(sources: Path) -> None:
    """The root of the book: the title and the table of contents of the index page, which is no chapter itself."""
    index = (sources / "index.md").read_text(encoding="utf-8")
    heading, toctree = re.search(r"^# .+$", index, re.MULTILINE), TOCTREE.search(index)
    if not heading or not toctree:
        sys.exit("%s has no title or no toctree" % (sources / "index.md"))
    (sources / "index.md").unlink()
    (sources / "book.md").write_text(
        "%s\n\n```{toctree}\n:maxdepth: 3\n\n%s```\n" % (heading.group(), toctree.group("entries")), encoding="utf-8")


def tex(latex: Path, strict: bool) -> Path:
    """xelatex three times, for the table of contents and the references; fails when it did not write the PDF."""
    name = Path(PDF).with_suffix(".tex").name
    for _ in range(3):
        subprocess.run(["xelatex", "-interaction=nonstopmode", "-halt-on-error", name], cwd=latex,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    log = (latex / Path(name).with_suffix(".log")).read_text(encoding="utf-8", errors="replace")
    if "Output written on" not in log:
        sys.exit("xelatex failed:\n" + "\n".join(line for line in log.splitlines() if line.startswith("!")))
    # xelatex leaves out a character that the font lacks and goes on
    missing = sorted(set(re.findall(r"^Missing character: (.*)$", log, re.MULTILINE)))
    if missing:
        print("xelatex: %s" % "; ".join(missing), file=sys.stderr)
        if strict:
            sys.exit("the fonts of the PDF lack characters")
    return latex / Path(name).with_suffix(".pdf")


def build_pdf(hikaripb: Path, output: Path, strict: bool) -> None:
    for program in ("xelatex", "rsvg-convert"):
        if shutil.which(program) is None:
            sys.exit("%s not found: install it for the PDF, or pass --no-pdf" % program)
    sources, latex = GENERATED / "pdf-src", GENERATED / "latex"
    generate(hikaripb, sources, strict, book=True)
    make_book(sources)
    sphinx("latex", sources, latex, strict, "root_doc=book")
    shutil.copy(tex(latex, strict), output / PDF)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--hikaripb", required=True, type=Path, help="checkout of protoc-plugin-hikaripb")
    parser.add_argument("--output", default=GENERATED / "html", type=Path, help="folder of the pages")
    parser.add_argument("--strict", action="store_true", help="fail on a message of the plugin or a warning")
    parser.add_argument("--no-pdf", action="store_true", help="do not build the PDF")
    args = parser.parse_args()
    hikaripb, output = args.hikaripb.resolve(), args.output.resolve()

    sources = GENERATED / "docs-src"
    generate(hikaripb, sources, args.strict, book=False)
    sphinx("html", sources, output, args.strict)
    print("Documentation: %s" % (output / "index.html"))
    if not args.no_pdf:
        build_pdf(hikaripb, output, args.strict)
        print("PDF: %s" % (output / PDF))


if __name__ == "__main__":
    main()
