#!/usr/bin/env python3
"""Apply workspace-disabled extensions for mohetios.dev in Cursor/VS Code."""

from __future__ import annotations

import json
import os
import sqlite3
import sys
from pathlib import Path

KEEP = {
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "vue.volar",
    "bradlc.vscode-tailwindcss",
    "graphql.vscode-graphql-syntax",
    "editorconfig.editorconfig",
    "antfu.goto-alias",
    "davidanson.vscode-markdownlint",
    "michelemelluso.gitignore",
    "actboy168.tasks",
    "foxundermoon.shell-format",
    "lkrms.inifmt",
    "tamasfe.even-better-toml",
    "k--kato.intellij-idea-keybindings",
    "redhat.vscode-yaml",
    "fabiospampinato.vscode-monokai-night",
    "wesbos.theme-cobalt2",
    "mcagampan.dark-horizon",
    "alexandernanberg.horizon-theme-vscode",
    "jdinhlife.gruvbox",
}


def extension_catalog() -> dict[str, str | None]:
    for base in (
        Path.home() / ".cursor/extensions/extensions.json",
        Path.home() / ".vscode/extensions/extensions.json",
    ):
        if base.is_file():
            entries = json.loads(base.read_text())
            return {
                entry["identifier"]["id"]: entry["identifier"].get("uuid")
                for entry in entries
                if entry.get("identifier", {}).get("id")
            }
    raise SystemExit("No Cursor/VS Code extension catalog found.")


def workspace_db(project_root: Path) -> Path:
    for app_dir in ("Cursor", "Code"):
        storage = Path.home() / ".config" / app_dir / "User/workspaceStorage"
        if not storage.is_dir():
            continue
        for folder in storage.iterdir():
            workspace_json = folder / "workspace.json"
            if not workspace_json.is_file():
                continue
            data = json.loads(workspace_json.read_text())
            folder_uri = data.get("folder", "")
            if str(project_root) in folder_uri:
                return folder / "state.vscdb"
    raise SystemExit(f"No workspace storage found for {project_root}")


def main() -> int:
    project_root = Path(__file__).resolve().parents[1]
    catalog = extension_catalog()
    disabled = []
    for ext_id, uuid in sorted(catalog.items()):
        if ext_id in KEEP:
            continue
        entry: dict[str, str] = {"id": ext_id}
        if uuid:
            entry["uuid"] = uuid
        disabled.append(entry)

    db_path = workspace_db(project_root)
    payload = json.dumps(disabled, separators=(",", ":"))
    with sqlite3.connect(db_path) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)",
            ("extensionsIdentifiers/disabled", payload),
        )
        conn.commit()

    print(f"Disabled {len(disabled)} extensions for {project_root.name} ({db_path.parent.name}).")
    print("Reload the Cursor window: Developer: Reload Window")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
