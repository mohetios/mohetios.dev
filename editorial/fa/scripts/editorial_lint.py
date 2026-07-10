#!/usr/bin/env python3
"""Deterministic lint checks for Mohetios Persian editorial content.

The linter catches mechanical and high-signal style risks. It intentionally
avoids auto-fixing prose: voice, factual accuracy, and reasoning still require
rubric-based review.
"""

from __future__ import annotations

import argparse
import fnmatch
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[3]
CONFIG_PATH = ROOT / "editorial/fa/editorial-config.json"

PERSIAN_RANGE = "\u0600-\u06FF"
ARABIC_YEH = "\u064A"
ARABIC_KAF = "\u0643"


@dataclass
class Issue:
    path: str
    line: int
    severity: str
    code: str
    message: str
    excerpt: str = ""


def load_config() -> dict:
    try:
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SystemExit(f"Missing config: {CONFIG_PATH}") from exc
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {CONFIG_PATH}: {exc}") from exc


def iter_files(inputs: list[str], excludes: list[str]) -> Iterable[Path]:
    seen: set[Path] = set()
    for raw in inputs:
        path = Path(raw)
        if not path.is_absolute():
            path = (Path.cwd() / path).resolve()
        if path.is_file():
            candidates = [path]
        elif path.is_dir():
            candidates = [
                item
                for item in path.rglob("*")
                if item.is_file()
                and item.suffix.lower() in {".md", ".mdx", ".yml", ".yaml"}
            ]
        else:
            print(f"warning: path not found: {raw}", file=sys.stderr)
            continue

        for candidate in candidates:
            try:
                rel = candidate.relative_to(ROOT).as_posix()
            except ValueError:
                rel = candidate.as_posix()
            if any(fnmatch.fnmatch(rel, pattern) for pattern in excludes):
                continue
            if candidate not in seen:
                seen.add(candidate)
                yield candidate


def visible_lines(text: str):
    """Yield source lines outside fenced code blocks with inline code/URLs masked."""
    in_fence = False
    fence_char: str | None = None
    for index, line in enumerate(text.splitlines(), start=1):
        stripped = line.lstrip()
        match = re.match(r"(```+|~~~+)", stripped)
        if match:
            marker = match.group(1)[0]
            if not in_fence:
                in_fence = True
                fence_char = marker
            elif marker == fence_char:
                in_fence = False
                fence_char = None
            continue
        if in_fence:
            continue
        cleaned = re.sub(r"`[^`]*`", "", line)
        cleaned = re.sub(r"https?://\S+", "", cleaned)
        yield index, cleaned


def add(
    issues: list[Issue],
    path: Path,
    line: int,
    severity: str,
    code: str,
    message: str,
    excerpt: str = "",
) -> None:
    try:
        shown = path.relative_to(Path.cwd()).as_posix()
    except ValueError:
        shown = path.as_posix()
    issues.append(
        Issue(
            path=shown,
            line=line,
            severity=severity,
            code=code,
            message=message,
            excerpt=excerpt.strip()[:180],
        )
    )


def lint_file(path: Path, config: dict) -> list[Issue]:
    issues: list[Issue] = []
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        add(issues, path, 1, "error", "encoding", "File is not valid UTF-8.")
        return issues

    max_para = int(config.get("max_paragraph_chars_warning", 900))
    paragraph: list[tuple[int, str]] = []

    def flush_paragraph() -> None:
        nonlocal paragraph
        if not paragraph:
            return
        joined = " ".join(part for _, part in paragraph)
        if len(joined) > max_para:
            add(
                issues,
                path,
                paragraph[0][0],
                "warning",
                "long-paragraph",
                f"Paragraph is {len(joined)} characters; split it at a reasoning boundary.",
                joined,
            )
        paragraph = []

    for line_no, line in visible_lines(text):
        stripped = line.strip()

        if ARABIC_YEH in line:
            add(issues, path, line_no, "error", "arabic-yeh", "Use Persian yeh (ی), not Arabic yeh (ي).", line)
        if ARABIC_KAF in line:
            add(issues, path, line_no, "error", "arabic-kaf", "Use Persian kaf (ک), not Arabic kaf (ك).", line)
        if re.search(rf"[{PERSIAN_RANGE}]\s+[،؛؟]", line):
            add(issues, path, line_no, "error", "space-before-persian-punctuation", "Remove the space before Persian punctuation.", line)
        if re.search(r"\s+[.!,:;?](?:\s|$)", line):
            add(issues, path, line_no, "warning", "space-before-latin-punctuation", "Unexpected space before punctuation.", line)
        if re.search(rf"[{PERSIAN_RANGE}],[{PERSIAN_RANGE}\s]", line):
            add(issues, path, line_no, "warning", "latin-comma", "Use Persian comma (،) in Persian prose when appropriate.", line)
        if re.search(r"(?<!\S)(?:می|نمی)\s+[آ-ی]", line):
            add(issues, path, line_no, "error", "missing-zwnj-mi", "Use ZWNJ after می/نمی, for example می‌شود.", line)
        if re.search(r"[آ-ی]\s+ها(?:ی|یم|یت|یش|مان|تان|شان)?\b", line):
            add(issues, path, line_no, "warning", "possible-missing-zwnj-ha", "Possible missing ZWNJ before the plural suffix ها.", line)
        if "  " in line and not stripped.startswith("|"):
            add(issues, path, line_no, "warning", "double-space", "Repeated spaces found in prose.", line)

        for phrase in config.get("forbidden_phrases", []):
            if phrase in line:
                add(issues, path, line_no, "error", "forbidden-phrase", f"Forbidden or strongly AI-like phrase: {phrase}", line)
        for phrase in config.get("suspicious_phrases", []):
            if phrase in line:
                add(issues, path, line_no, "warning", "suspicious-claim", f"Review promotional or absolute wording: {phrase}", line)
        for phrase in config.get("hard_fail_patterns", []):
            if phrase.casefold() in line.casefold():
                add(issues, path, line_no, "warning", "security-hard-gate", f"Security/privacy claim requires explicit repository evidence: {phrase}", line)

        heading = re.match(r"^(#{1,6})\s+", stripped)
        if heading and len(heading.group(1)) > int(config.get("max_heading_depth", 4)):
            add(issues, path, line_no, "warning", "deep-heading", "Heading depth exceeds the editorial default.", line)

        if stripped and not stripped.startswith(("#", "-", "*", ">", "|", "---")):
            paragraph.append((line_no, stripped))
        else:
            flush_paragraph()

    flush_paragraph()
    return issues


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", default=["content/fa"], help="Files or directories to lint")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as failure")
    parser.add_argument("--json", action="store_true", dest="json_output", help="Print JSON")
    args = parser.parse_args()

    config = load_config()
    files = list(iter_files(args.paths, config.get("exclude_paths", [])))
    all_issues: list[Issue] = []
    for path in files:
        all_issues.extend(lint_file(path, config))

    if args.json_output:
        print(json.dumps([asdict(item) for item in all_issues], ensure_ascii=False, indent=2))
    else:
        for issue in all_issues:
            print(f"{issue.path}:{issue.line}: {issue.severity}: {issue.code}: {issue.message}")
            if issue.excerpt:
                print(f"  {issue.excerpt}")
        errors = sum(item.severity == "error" for item in all_issues)
        warnings = sum(item.severity == "warning" for item in all_issues)
        print(f"\nScanned {len(files)} file(s): {errors} error(s), {warnings} warning(s).")

    has_errors = any(item.severity == "error" for item in all_issues)
    has_warnings = any(item.severity == "warning" for item in all_issues)
    return 1 if has_errors or (args.strict and has_warnings) else 0


if __name__ == "__main__":
    raise SystemExit(main())
