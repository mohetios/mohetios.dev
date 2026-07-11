#!/usr/bin/env python3
"""Compare protected literals between a source and an edited file."""
from __future__ import annotations
import argparse,re,sys
from collections import Counter
from pathlib import Path

URL=re.compile(r"https?://[^\s)\]>'\"]+")
INLINE=re.compile(r"`[^`\n]+`")
PLACEHOLDER=re.compile(r"\{\{[^{}]+\}\}|\$\{[^{}]+\}|%\([^)]+\)s|:[A-Za-z_][A-Za-z0-9_]*")
FENCE=re.compile(r"(^```.*?^```|^~~~.*?^~~~)",re.M|re.S)
FRONT=re.compile(r"\A---\n.*?\n---\n",re.S)

def extract(text:str)->Counter:
    values=[]
    for rx in (URL,INLINE,PLACEHOLDER,FENCE,FRONT):values.extend(m.group(0) for m in rx.finditer(text))
    return Counter(values)

def main()->int:
    ap=argparse.ArgumentParser();ap.add_argument("before",type=Path);ap.add_argument("after",type=Path);args=ap.parse_args()
    a=extract(args.before.read_text(encoding="utf-8"));b=extract(args.after.read_text(encoding="utf-8"))
    missing=a-b;added=b-a
    if missing:
        print("Missing/changed protected literals:")
        for value,count in missing.items():print(f"- {count}× {value[:180]}")
    if added:
        print("New protected literals (review):")
        for value,count in added.items():print(f"- {count}× {value[:180]}")
    if not missing and not added:print("Protected literals preserved.")
    return 1 if missing else 0
if __name__=="__main__":raise SystemExit(main())
