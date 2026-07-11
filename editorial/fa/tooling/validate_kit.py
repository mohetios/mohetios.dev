#!/usr/bin/env python3
from __future__ import annotations
import json,re,sys
from pathlib import Path
KIT=Path(__file__).resolve().parents[1];ROOT=KIT.parents[1]
REQ=["KIT_VERSION","ENTRYPOINT.md","README.md","WORKFLOW.md","editorial-config.json","core/principles.md","core/natural-persian.md","core/writing-mechanics.md","core/reasoning-and-structure.md","core/factual-integrity.md","core/temporal-integrity.md","core/transformation-contract.md","core/context-resolution.md","core/review-invariants.md","profiles/ali/voice.md","profiles/ali/reasoning-style.md","dimensions/task-brief.schema.json","evaluation/cases.json","evaluation/rubric.md","evaluation/hard-gates.md","tooling/editorial_lint.py","tooling/preserve_check.py","tooling/run_eval_checks.py"]
def main()->int:
    errors=[];warnings=[]
    for x in REQ:
        if not (KIT/x).exists():errors.append(f"missing editorial/fa/{x}")
    try:
        version=(KIT/"KIT_VERSION").read_text().strip();cfg=json.loads((KIT/"editorial-config.json").read_text())
        if cfg.get("version")!=version:errors.append("KIT_VERSION and config version mismatch")
        cases=json.loads((KIT/"evaluation/cases.json").read_text());ids=[x["id"] for x in cases]
        if len(ids)!=len(set(ids)):errors.append("duplicate eval ids")
        for x in cases:
            for key in ("id","operation","purpose","surface","temporal_mode","input","must_preserve","must_include_concepts","must_avoid","protected_literals","hard_gates","review_notes"):
                if key not in x:errors.append(f"eval {x.get('id','?')} missing {key}")
    except Exception as e:errors.append(f"parse error: {e}")
    for p in (KIT/"profiles/ali/corpus/approved").glob("*.md"):
        if p.name=="README.md":continue
        t=p.read_text(encoding="utf-8")
        for key in ("approved_by:","approved_at:","source:","surface:"):
            if key not in t:errors.append(f"approved corpus metadata missing {key}: {p.name}")
    forbidden_names=("nekonymous","irophome","mamochi","safarnak")
    for folder in (KIT/"core",KIT/"dimensions",KIT/"profiles/ali"):
        for p in folder.rglob("*.md"):
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
