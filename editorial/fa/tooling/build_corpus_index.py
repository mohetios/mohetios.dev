#!/usr/bin/env python3
from __future__ import annotations
import json,re
from pathlib import Path
KIT=Path(__file__).resolve().parents[1];CORPUS=KIT/"profiles/ali/corpus";OUT=CORPUS/"index.json"
def main():
    items=[]
    for p in sorted(CORPUS.rglob("*.md")):
        if p.name=="README.md":continue
        text=p.read_text(encoding="utf-8");status="unknown"
        m=re.search(r"^status:\s*(.+)$",text,re.M)
        if m:status=m.group(1).strip()
        if "approved_by:" in text:status="approved"
        items.append({"path":p.relative_to(KIT).as_posix(),"status":status,"sha256":__import__('hashlib').sha256(text.encode()).hexdigest()})
    OUT.write_text(json.dumps(items,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Indexed {len(items)} corpus files -> {OUT}")
if __name__=="__main__":main()
