#!/usr/bin/env python3
"""Static checks for Persian Editorial Engine eval outputs."""
from __future__ import annotations
import argparse,json
from pathlib import Path
KIT=Path(__file__).resolve().parents[1]
CASES=KIT/"evaluation/cases.json"
def load():return json.loads(CASES.read_text(encoding="utf-8"))
def normalize(data):
    if isinstance(data,dict) and "outputs" in data:data=data["outputs"]
    if isinstance(data,dict):return {str(k):{"id":str(k),"output":v if isinstance(v,str) else ""} for k,v in data.items()}
    if not isinstance(data,list):raise ValueError("outputs must be list or mapping")
    return {str(x["id"]):x for x in data}
def main()->int:
    ap=argparse.ArgumentParser();ap.add_argument("outputs",type=Path);ap.add_argument("--json",action="store_true",dest="as_json");args=ap.parse_args()
    cases=load();outs=normalize(json.loads(args.outputs.read_text(encoding="utf-8")));reports=[];failed=False
    for c in cases:
        out=str(outs.get(c["id"],{}).get("output",""));errors=[]
        if not out.strip():errors.append("missing or empty output")
        for x in c.get("must_avoid",[]):
            if x and x in out:errors.append(f"contains must_avoid: {x}")
        for x in c.get("protected_literals",[]):
            if x not in out:errors.append(f"missing protected literal: {x}")
        reports.append({"id":c["id"],"status":"fail" if errors else "pass","errors":errors,"manual_review":c.get("hard_gates",[])+c.get("must_preserve",[])+c.get("must_include_concepts",[])})
        failed|=bool(errors)
    if args.as_json:print(json.dumps(reports,ensure_ascii=False,indent=2))
    else:
        for r in reports:
            print(f"[{r['status'].upper()}] {r['id']}")
            for e in r['errors']:print(f"  - {e}")
        print(f"Static result: {sum(r['status']=='pass' for r in reports)}/{len(reports)}")
        print("Semantic, voice and hard-gate review remains manual/model-assisted.")
    return 1 if failed else 0
if __name__=="__main__":raise SystemExit(main())
