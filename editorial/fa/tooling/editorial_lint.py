#!/usr/bin/env python3
"""Dependency-free Persian editorial linter.

Checks mechanical and high-signal language issues while ignoring frontmatter,
fenced code blocks, inline code and URLs. It does not claim to measure voice.
"""
from __future__ import annotations
import argparse, fnmatch, json, re, subprocess, sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Sequence

KIT = Path(__file__).resolve().parents[1]
ROOT = KIT.parents[1]
CONFIG_PATH = KIT / "editorial-config.json"
TEXT_SUFFIXES={".md",".mdx",".txt",".yaml",".yml",".json"}
URL_RE=re.compile(r"https?://\S+")
INLINE_CODE_RE=re.compile(r"`[^`\n]*`")
FENCE_RE=re.compile(r"^\s*(```|~~~)")
HEADING_RE=re.compile(r"^(#{1,6})\s+")
MULTISPACE_RE=re.compile(r"[ \t]{2,}")
SPACE_BEFORE_PUNCT_RE=re.compile(r"\s+([،؛؟!,:.])")
REPEATED_PUNCT_RE=re.compile(r"([!؟?،,؛;])\1+")
LATIN_QMARK_AFTER_PERSIAN_RE=re.compile(r"[\u0600-\u06FF]\?")
PERSIAN_RE=re.compile(r"[\u0600-\u06FF]")
L="\u0621-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06CC"  # Persian letters (no digits/punctuation)
ZWNJ="\u200c"
# Detection and its safe --fix share one regex so they can't disagree.
MI_SPACE_RE=re.compile(rf"(?<![{L}])(ن?می) (?=[{L}])")
SUFFIX_SPACE_RE=re.compile(rf"([{L}]) (ها|های|هایی|ترین)(?![{L}])")
STRAY_ZWNJ_RE=re.compile(rf"{ZWNJ}+(?=[\s{ZWNJ}]|$)|(?<=\s){ZWNJ}+|(?<={ZWNJ}){ZWNJ}+")
LATIN_COMMA_RE=re.compile(rf"(?<=[{L}]),(?=\s*[{L}])")
FA_SPACE_PUNCT_RE=re.compile(rf"(?<=[{L}])[ \t]+(?=[،؛؟])")
FIXES=[(MI_SPACE_RE,r"\1"+ZWNJ),(SUFFIX_SPACE_RE,r"\1"+ZWNJ+r"\2"),(STRAY_ZWNJ_RE,""),(LATIN_COMMA_RE,"،"),
       (LATIN_QMARK_AFTER_PERSIAN_RE,lambda m:m.group(0)[0]+"؟"),(FA_SPACE_PUNCT_RE,"")]
MECHANICS=[
    (MI_SPACE_RE,"error","zwnj-mi","Use ZWNJ after می/نمی: می‌شود (--fix)."),
    (SUFFIX_SPACE_RE,"warning","zwnj-suffix","Attach ها/های/ترین with ZWNJ: کتاب‌ها (--fix)."),
    (STRAY_ZWNJ_RE,"warning","stray-zwnj","Stray or doubled ZWNJ (--fix)."),
    (LATIN_COMMA_RE,"warning","latin-comma","Use Persian comma ، between Persian words (--fix)."),
    (LATIN_QMARK_AFTER_PERSIAN_RE,"warning","latin-question-mark","Use Persian question mark after Persian prose (--fix)."),
    (SPACE_BEFORE_PUNCT_RE,"warning","space-before-punctuation","Remove space before punctuation."),
    (REPEATED_PUNCT_RE,"warning","repeated-punctuation","Avoid repeated punctuation."),
]
# Standalone numbers only: versions (1.21), identifiers (P2P, v2) and paths are not prose digits.
FA_NUMBER_RE=re.compile(r"[۰-۹]+")
LATIN_NUMBER_RE=re.compile(r"(?<![\w.\-/:#])[0-9]+(?![\w\-/:]|\.[0-9])")
SUPPRESS_NEXT="editorial-lint-disable-next-line"
SUPPRESS_FILE="editorial-lint-disable-file"
MASK="¤"

@dataclass(frozen=True)
class Issue:
    path:str; line:int; column:int; severity:str; code:str; message:str; excerpt:str=""

def load_config():
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))

def rel(path:Path)->str:
    try:return path.resolve().relative_to(ROOT.resolve()).as_posix()
    except ValueError:return path.as_posix()

def excluded(path:Path,cfg:dict)->bool:
    value=rel(path)
    return any(fnmatch.fnmatch(value,p) for p in cfg.get("exclude_paths",[]))

def expand(values:Sequence[str],cfg:dict)->list[Path]:
    found:set[Path]=set()
    if not values: values=cfg.get("default_content_paths",[])
    for raw in values:
        candidate=Path(raw)
        if not candidate.is_absolute(): candidate=ROOT/candidate
        if any(c in raw for c in "*?["):
            for p in ROOT.glob(raw):
                if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES:found.add(p.resolve())
        elif candidate.is_dir():
            for p in candidate.rglob("*"):
                if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES:found.add(p.resolve())
        elif candidate.is_file() and candidate.suffix.lower() in TEXT_SUFFIXES: found.add(candidate.resolve())
    return sorted(p for p in found if not excluded(p,cfg))

def changed_files(staged=False)->list[str]:
    cmds=[["git","diff","--cached","--name-only","--diff-filter=ACMR"]] if staged else [
      ["git","diff","--name-only","--diff-filter=ACMR"],["git","diff","--cached","--name-only","--diff-filter=ACMR"]]
    names=set()
    for cmd in cmds:
        try:r=subprocess.run(cmd,cwd=ROOT,capture_output=True,text=True,check=False)
        except OSError:return []
        if r.returncode==0:names.update(x.strip() for x in r.stdout.splitlines() if x.strip())
    return sorted(names)

def mask_inline(line:str)->str:
    masked=URL_RE.sub(lambda m:MASK*len(m.group(0)),line)
    return INLINE_CODE_RE.sub(lambda m:MASK*len(m.group(0)),masked)

def mask_lines(lines:list[str]):
    out=[]; protected=[]; in_fence=False; in_front=False
    for i,original in enumerate(lines):
        stripped=original.strip()
        if i==0 and stripped=="---":in_front=True;out.append(" "*len(original));protected.append(True);continue
        if in_front:
            out.append(" "*len(original));protected.append(True)
            if stripped=="---":in_front=False
            continue
        if FENCE_RE.match(original):in_fence=not in_fence;out.append(" "*len(original));protected.append(True);continue
        if in_fence:out.append(" "*len(original));protected.append(True);continue
        out.append(mask_inline(original));protected.append(False)
    return out,protected

def fix_line(raw:str,masked:str,cfg:dict)->str:
    """Apply FIXES to the unmasked spans of one line; URLs and inline code stay byte-identical."""
    out=[];i=0
    while i<len(raw):
        j=i;prot=masked[i]==MASK
        while j<len(raw) and (masked[j]==MASK)==prot:j+=1
        seg=raw[i:j]
        if not prot:
            for bad,good in cfg.get("arabic_characters",{}).items():seg=seg.replace(bad,good)
            for rx,repl in FIXES:seg=rx.sub(repl,seg)
        out.append(seg);i=j
    return "".join(out)

def is_negated(line:str,start:int,end:int)->bool:
    before=line[max(0,start-55):start].lower();after=line[end:end+65].lower()
    return any(x in before for x in ("نه ","ادعای ","ممنوع","پرهیز","avoid","do not","not ")) or any(x in after for x in (" نیست"," ندارد"," نمی‌شود"," نمی‌کند"," ممنوع است"," مجاز نیست"," is not"," cannot"))

def add(items,path,line,col,sev,code,msg,raw):
    items.append(Issue(path,line,col+1,sev,code,msg,raw.rstrip()[:160]))

def lint_text(text:str,path:str,cfg:dict,structured:bool=False,fix:bool=False)->tuple[list[Issue],str]:
    lines=text.splitlines(keepends=True);masked,protected=mask_lines(lines);items=[]
    if any(SUPPRESS_FILE in x for x in lines[:5]):return items,text
    blank_run=0;suppress=False;paragraph=[];digits={}
    calques=[(re.compile(c["pattern"]),c["hint"]) for c in cfg.get("calques",[])]
    def flush():
        nonlocal paragraph
        if paragraph:
            size=sum(len(x.strip()) for _,x in paragraph);limit=int(cfg.get("max_paragraph_chars_warning",1000))
            if size>limit:add(items,path,paragraph[0][0],0,"warning","paragraph-length",f"Paragraph is {size} chars; threshold {limit}.",paragraph[0][1])
        paragraph=[]
    for idx,(raw,line,prot) in enumerate(zip(lines,masked,protected),1):
        if prot:flush();blank_run=0;continue
        if SUPPRESS_NEXT in raw:suppress=True;flush();continue
        if suppress:suppress=False;flush();continue
        if fix:
            raw=lines[idx-1]=fix_line(raw,line,cfg);line=mask_inline(raw)
        stripped=line.strip()
        if not stripped:
            blank_run+=1;flush();max_blank=int(cfg.get("max_consecutive_blank_lines",2))
            if blank_run>max_blank:add(items,path,idx,0,"warning","blank-lines",f"More than {max_blank} consecutive blank lines.",raw)
            continue
        blank_run=0
        if not structured and not HEADING_RE.match(line) and not stripped.startswith(("-","*",">","|")):paragraph.append((idx,raw))
        h=None if structured else HEADING_RE.match(line)
        if h and len(h.group(1))>int(cfg.get("max_heading_depth",4)):add(items,path,idx,0,"warning","heading-depth","Heading depth is too high.",raw)
        for bad,good in cfg.get("arabic_characters",{}).items():
            pos=line.find(bad)
            if pos>=0:add(items,path,idx,pos,"error","arabic-character",f"Use {good} instead of {bad} (--fix).",raw)
        for rx,sev,code,msg in MECHANICS:
            m=rx.search(line)
            if m:add(items,path,idx,m.start(),sev,code,msg,raw)
        if not structured and not stripped.startswith("|"):
            prose=line.rstrip("\n")
            leading=len(prose)-len(prose.lstrip(" \t"))
            m=MULTISPACE_RE.search(prose,leading)
            if m:add(items,path,idx,m.start(),"warning","multiple-spaces","Avoid repeated spaces in prose.",raw)
            if PERSIAN_RE.search(line):
                for kind,rx in (("persian",FA_NUMBER_RE),("latin",LATIN_NUMBER_RE)):
                    m=rx.search(line)
                    if m:digits.setdefault(kind,(idx,m.start(),raw))
        for phrase in cfg.get("forbidden_phrases",[]):
            start=line.find(phrase)
            if start>=0 and not is_negated(line,start,start+len(phrase)):add(items,path,idx,start,"error","forbidden-phrase",f"Avoid generic/AI-like phrase: {phrase}",raw)
        for phrase in cfg.get("suspicious_phrases",[]):
            start=line.find(phrase)
            if start>=0 and not is_negated(line,start,start+len(phrase)):add(items,path,idx,start,"warning","suspicious-claim",f"Review unsupported or absolute wording: {phrase}",raw)
        for phrase in cfg.get("high_risk_claims",[]):
            start=line.lower().find(phrase.lower())
            if start>=0 and not is_negated(line,start,start+len(phrase)):add(items,path,idx,start,"error","high-risk-claim",f"High-risk claim requires explicit evidence: {phrase}",raw)
        for rx,hint in calques:
            m=rx.search(line)
            if m:add(items,path,idx,m.start(),"info","calque",f"Translationese «{m.group(0)}»: {hint}",raw)
    flush()
    if len(digits)==2:
        idx,col,raw=digits["latin"]
        add(items,path,idx,col,"warning","mixed-digits",f"Prose mixes Persian digits (line {digits['persian'][0]}) and Latin digits; pick one policy per document.",raw)
    return items,"".join(lines)

def lint(path:Path,cfg:dict,fix:bool=False)->list[Issue]:
    try:text=path.read_text(encoding="utf-8")
    except UnicodeDecodeError:return [Issue(rel(path),1,1,"error","encoding","File is not UTF-8")]
    items,fixed=lint_text(text,rel(path),cfg,path.suffix.lower() in {".json",".yaml",".yml"},fix)
    if fix and fixed!=text:path.write_text(fixed,encoding="utf-8");print(f"fixed {rel(path)}")
    return items

def main()->int:
    ap=argparse.ArgumentParser();ap.add_argument("paths",nargs="*");ap.add_argument("--changed",action="store_true");ap.add_argument("--staged",action="store_true");ap.add_argument("--strict",action="store_true");ap.add_argument("--fix",action="store_true",help="apply safe mechanical fixes (Arabic letters, ZWNJ, Persian punctuation) outside code and URLs");ap.add_argument("--json",action="store_true",dest="as_json");args=ap.parse_args()
    cfg=load_config();values=args.paths
    if args.changed or args.staged:
        values=changed_files(staged=args.staged)
        paths=expand(values,cfg) if values else []
    else:
        paths=expand(values,cfg)
    issues=[i for p in paths for i in lint(p,cfg,args.fix)]
    if args.as_json:print(json.dumps([asdict(x) for x in issues],ensure_ascii=False,indent=2))
    else:
        for i in issues:print(f"{i.path}:{i.line}:{i.column}: {i.severity} {i.code}: {i.message}\n  {i.excerpt}")
        print(f"Checked {len(paths)} files; {len(issues)} issues.")
    errors=sum(i.severity=="error" for i in issues);warnings=sum(i.severity=="warning" for i in issues)
    return 1 if errors or (args.strict and warnings) else 0
if __name__=="__main__":raise SystemExit(main())
