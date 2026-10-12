#!/usr/bin/env python3
"""Compare protected literals between a source and an edited file.

  preserve_check.py BEFORE AFTER         two files
  preserve_check.py FILE... [--base REF] each file against its git version
                                          (default HEAD; pass --base for exactly two files)
  preserve_check.py --changed [--base REF]  every changed Persian text file

Protected: frontmatter, code fences, inline code, URLs, link targets, placeholders
and prose numbers (Persian and Latin digits compare equal, so a digit-policy change
is not a fact change). Missing literals fail; new ones are listed for review.
"""
from __future__ import annotations
import argparse,re,subprocess
from collections import Counter
from pathlib import Path
from editorial_lint import ROOT,TEXT_SUFFIXES,PERSIAN_RE,excluded,load_config

URL=re.compile(r"https?://[^\s)\]>'\"]+")
INLINE=re.compile(r"`[^`\n]+`")
LINK=re.compile(r"\]\(([^)\s]+)")
PLACEHOLDER=re.compile(r"\{\{[^{}]+\}\}|\$\{[^{}]+\}|%\([^)]+\)s|:[A-Za-z_][A-Za-z0-9_]*")
FENCE=re.compile(r"(^```.*?^```|^~~~.*?^~~~)",re.M|re.S)
FRONT=re.compile(r"\A---\n.*?\n---\n",re.S)
NUMBER=re.compile(r"(?<![A-Za-z_\-./\d])\d+(?:[.,]\d+)*(?![A-Za-z_\d])")
DIGITS=str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩٫٬","01234567890123456789.,")

def extract(text:str)->Counter:
    values=[]
    for rx in (FRONT,FENCE):
        values.extend(m.group(0) for m in rx.finditer(text));text=rx.sub(" ",text)
    values.extend(f"link {m.group(1)}" for m in LINK.finditer(text))
    for rx in (URL,INLINE,PLACEHOLDER):
        values.extend(m.group(0) for m in rx.finditer(text));text=rx.sub(" ",text)
    values.extend(f"number {m.group(0).replace(',','')}" for m in NUMBER.finditer(text.translate(DIGITS)))
    return Counter(values)

def git(*args)->subprocess.CompletedProcess:
    return subprocess.run(["git",*args],cwd=ROOT,capture_output=True,text=True,check=False)

def compare(label:str,before:str,after:str)->bool:
    a=extract(before);b=extract(after);missing=a-b;added=b-a
    if not missing and not added:return True
    print(f"{label}:")
    for value,count in missing.items():print(f"  - missing {count}× {value[:180]}")
    for value,count in added.items():print(f"  + new {count}× {value[:180]} (review)")
    return not missing

def main()->int:
    ap=argparse.ArgumentParser();ap.add_argument("paths",nargs="*",type=Path);ap.add_argument("--base");ap.add_argument("--changed",action="store_true");args=ap.parse_args()
    if len(args.paths)==2 and args.base is None and not args.changed:
        ok=compare(f"{args.paths[0]} -> {args.paths[1]}",args.paths[0].read_text(encoding="utf-8"),args.paths[1].read_text(encoding="utf-8"))
    else:
        args.base=args.base or "HEAD"
        if args.changed:
            cfg=load_config();names=git("diff","--name-only","--diff-filter=M",args.base).stdout.split()
            # Engine rule files are edited as rules, not transformed as content.
            paths=[ROOT/n for n in names if Path(n).suffix.lower() in TEXT_SUFFIXES and not n.startswith("editorial/") and not excluded(ROOT/n,cfg)]
        else:paths=[p.resolve() for p in args.paths]
        if not paths and not args.changed:ap.error("nothing to compare")
        ok=True;checked=0
        for p in paths:
            after=p.read_text(encoding="utf-8")
            if not PERSIAN_RE.search(after):continue
            r=git("show",f"{args.base}:{p.relative_to(ROOT).as_posix()}")
            if r.returncode:print(f"{p.relative_to(ROOT)}: not in {args.base}; skipped");continue
            checked+=1;ok&=compare(str(p.relative_to(ROOT)),r.stdout,after)
        print(f"Compared {checked} files against {args.base}.")
    if ok:print("Protected literals preserved.")
    return 0 if ok else 1
if __name__=="__main__":raise SystemExit(main())
