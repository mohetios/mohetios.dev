#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REQUIRED = [
    "AGENTS.md",
    "content/fa/AGENTS.md",
    "editorial/fa/README.md",
    "editorial/fa/KIT_VERSION",
    "editorial/fa/editorial-config.json",
    "editorial/fa/editorial-context.md",
    "editorial/fa/fa-content-modes.md",
    "editorial/fa/fa-writing-mechanics.md",
    "editorial/fa/fa-lexicon.md",
    "editorial/fa/fa-voice.md",
    "editorial/fa/fa-fact-safety.md",
    "editorial/fa/fa-review-rubric.md",
    "editorial/fa/fa-agent-workflow.md",
    "editorial/fa/scripts/editorial_lint.py",
]


def main() -> int:
    missing = [item for item in REQUIRED if not (ROOT / item).exists()]
    if missing:
        print("Missing required files:")
        for item in missing:
            print(f"- {item}")
        return 1

    try:
        config = json.loads((ROOT / "editorial/fa/editorial-config.json").read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        print(f"Invalid editorial config: {exc}")
        return 1

    kit_version = (ROOT / "editorial/fa/KIT_VERSION").read_text(encoding="utf-8").strip()
    if config.get("version") != kit_version:
        print("Version mismatch between KIT_VERSION and editorial-config.json")
        return 1

    print(f"Editorial kit {kit_version} is structurally valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
