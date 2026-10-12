#!/usr/bin/env python3
from __future__ import annotations
import json,re,sys
from pathlib import Path
KIT=Path(__file__).resolve().parents[1];ROOT=KIT.parents[1]
REQ=["ENTRYPOINT.md","core.md","reference.md","editorial-config.json","profiles/ali/voice.md","profiles/ali/examples.md","evaluation/cases.json","evaluation/README.md","tooling/editorial_lint.py","tooling/preserve_check.py","tooling/run_eval_checks.py"]
def main()->int:
    errors=[];warnings=[]
    for x in REQ:
        if not (KIT/x).exists():errors.append(f"missing editorial/fa/{x}")
    try:
        json.loads((KIT/"editorial-config.json").read_text())
        cases=json.loads((KIT/"evaluation/cases.json").read_text());ids=[x["id"] for x in cases]
        if len(ids)!=len(set(ids)):errors.append("duplicate eval ids")
        for x in cases:
            for key in ("id","operation","purpose","surface","temporal_mode","input","must_preserve","must_include_concepts","must_avoid","protected_literals","hard_gates","review_notes"):
                if key not in x:errors.append(f"eval {x.get('id','?')} missing {key}")
    except Exception as e:errors.append(f"parse error: {e}")
    for p in (KIT/"profiles/ali/approved").glob("*.md"):
        if p.name=="README.md":continue
        t=p.read_text(encoding="utf-8")
        for key in ("approved_by:","approved_at:","source:","surface:"):
            if key not in t:errors.append(f"approved corpus metadata missing {key}: {p.name}")
    forbidden_names=("nekonymous","irophome","mamochi","safarnak")
    for p in (KIT/"core.md",KIT/"reference.md",*(KIT/"profiles/ali").rglob("*.md")):
        low=p.read_text(encoding="utf-8").lower()
        for name in forbidden_names:
            if name in low:errors.append(f"project-specific name leaked into core/profile: {p.relative_to(KIT)} -> {name}")
    if errors:
        print("Validation failed:")
        for e in errors:print(f"- ERROR: {e}")
    else:print("Persian Editorial Engine validation passed.")
    for x in warnings:print(f"- WARNING: {x}")
    return 1 if errors else 0
if __name__=="__main__":raise SystemExit(main())
