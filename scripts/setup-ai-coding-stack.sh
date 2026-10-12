#!/usr/bin/env bash
set -Eeuo pipefail

# Mohetios.dev AI coding stack bootstrap
# Stack:
#   Headroom  -> transport/cache/context optimization (already installed/configured)
#   RTK       -> shell-output optimization
#   Serena    -> symbol/reference navigation + symbol-aware edits
#   Graphify  -> architecture/relationship/docs graph
#   Editorial -> Persian editorial engine bridge (editorial/fa)
#
# Run from anywhere inside the target Git repository:
#   bash scripts/setup-ai-coding-stack.sh
#
# Safe to re-run. Existing JSON hooks are merged, not replaced.
# Per-machine wiring (hooks, MCP, indexes) stays out of git: Claude uses
# .claude/settings.local.json + local-scope MCP; .codex/, .serena/ and
# graphify-out/ go to .git/info/exclude. Shared: AGENTS.md (hand-owned, except the
# graphify and Persian editorial sections), CLAUDE.md and GEMINI.md (editorial only).

export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"

log()  { printf '\n\033[1;36m==>\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

command -v git >/dev/null 2>&1 || die "git is required."
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || die "Run this inside a Git repository."
cd "$ROOT"

PROJECT_NAME="${AI_PROJECT_NAME:-$(basename "$ROOT")}"
STAMP="$(date +%Y%m%d-%H%M%S)"

log "Repository: $ROOT"
log "Project:    $PROJECT_NAME"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

ensure_rtk() {
  # rtk has no self-update; install.sh always fetches the latest checksum-verified release.
  log "Installing/updating RTK (official rtk-ai/rtk build)"
  curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
  export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
  hash -r

  command -v rtk >/dev/null 2>&1 || die "RTK install completed but rtk is not on PATH."
  rtk gain >/dev/null 2>&1 || die "A different 'rtk' may be installed. 'rtk gain' must work."
  rtk hook codex </dev/null >/dev/null 2>&1 || die "rtk >= 0.50 is required (rtk hook codex)."
  ok "RTK: $(rtk --version)"
}

ensure_graphify() {
  command -v uv >/dev/null 2>&1 || die "uv is required (pacman -S uv)."
  if command -v graphify >/dev/null 2>&1; then
    uv tool upgrade graphifyy >/dev/null || warn "Graphify upgrade failed; keeping the installed version."
  else
    uv tool install -p 3.13 graphifyy >/dev/null
  fi
  hash -r
  command -v graphify >/dev/null 2>&1 || die "Graphify is not on PATH after installation."
}

ensure_serena() {
  command -v uv >/dev/null 2>&1 || die "uv is required (pacman -S uv)."

  if command -v serena >/dev/null 2>&1; then
    log "Updating Serena"
    uv tool upgrade serena-agent >/dev/null || warn "Serena upgrade failed; keeping the installed version."
  else
    log "Installing Serena"
    uv tool install -p 3.13 serena-agent >/dev/null
  fi

  export PATH="$HOME/.local/bin:$PATH"
  hash -r
  command -v serena >/dev/null 2>&1 || die "Serena is not on PATH after installation."

  if [[ ! -f "$HOME/.serena/serena_config.yml" ]]; then
    SERENA_USAGE_REPORTING=false serena init
  fi

  ok "Serena: $(serena --version)"
}

backup_if_exists() {
  local file="$1"
  if [[ -f "$file" ]]; then
    mkdir -p ".ai/setup-backups/$STAMP"
    cp -a "$file" ".ai/setup-backups/$STAMP/$(echo "$file" | tr '/' '_')"
  fi
}

merge_json_hooks() {
  local file="$1"
  local client="$2"

  mkdir -p "$(dirname "$file")"
  backup_if_exists "$file"

  python3 - "$file" "$client" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
client = sys.argv[2]

try:
    data = json.loads(path.read_text()) if path.exists() and path.stat().st_size else {}
except json.JSONDecodeError as e:
    raise SystemExit(f"{path}: invalid JSON; refusing to overwrite it: {e}")

hooks = data.setdefault("hooks", {})

if client == "claude":
    wanted = {
        "PreToolUse": [
            {
                "matcher": "Bash",
                "hooks": [
                    {"type": "command", "command": "rtk hook claude"}
                ],
            },
            {
                # remind only counts Read/Grep bursts and resets on Serena calls;
                # every other tool is neutral, so don't spawn it for them.
                "matcher": "Read|Grep|mcp__serena__.*",
                "hooks": [
                    {"type": "command", "command": "serena-hooks remind --client=claude-code"}
                ],
            },
            {
                "matcher": "mcp__serena__.*",
                "hooks": [
                    {"type": "command", "command": "serena-hooks auto-approve --client=claude-code"}
                ],
            },
        ],
        "SessionStart": [
            {
                "matcher": "",
                "hooks": [
                    {"type": "command", "command": "serena-hooks activate --client=claude-code"}
                ],
            }
        ],
        "SessionEnd": [
            {
                "matcher": "",
                "hooks": [
                    {"type": "command", "command": "serena-hooks cleanup --client=claude-code"}
                ],
            }
        ],
    }
elif client == "codex":
    wanted = {
        "PreToolUse": [
            {
                "matcher": "Bash",
                "hooks": [
                    {"type": "command", "command": "rtk hook codex"}
                ],
            },
            {
                "matcher": "Bash",
                "hooks": [
                    {"type": "command", "command": "serena-hooks remind --client=codex"}
                ],
            },
        ],
        "SessionStart": [
            {
                "matcher": "startup|resume",
                "hooks": [
                    {"type": "command", "command": "serena-hooks activate --client=codex"}
                ],
            }
        ],
        "SessionEnd": [
            {
                "hooks": [
                    {"type": "command", "command": "serena-hooks cleanup --client=codex"}
                ],
            }
        ],
    }
else:
    raise SystemExit(f"Unknown hook client: {client}")

def commands_in(entry):
    return {
        h.get("command")
        for h in entry.get("hooks", [])
        if isinstance(h, dict) and h.get("command")
    }

# Replace our entries (so matcher/command changes land) and keep everyone else's.
# `graphify codex install` adds a `graphify hook-check` PreToolUse hook that is a
# hard-coded no-op — a Python spawn per Bash call for nothing.
ours = {c for entries in wanted.values() for e in entries for c in commands_in(e)}
def is_ours(cmd):
    return cmd in ours or cmd.endswith("graphify hook-check")

# A global rtk hook already covers this repo; a second one runs every Bash call twice.
global_settings = Path.home() / ".claude" / "settings.json"
if client == "claude" and global_settings.exists() and "rtk hook claude" in global_settings.read_text():
    wanted["PreToolUse"] = [e for e in wanted["PreToolUse"] if "rtk hook claude" not in commands_in(e)]

for event in list(hooks):
    hooks[event] = [
        e for e in hooks[event]
        if not (isinstance(e, dict) and any(is_ours(c) for c in commands_in(e)))
    ]
    if not hooks[event]:
        del hooks[event]

for event, entries in wanted.items():
    hooks.setdefault(event, []).extend(entries)

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
PY
}

upsert_codex_project_config() {
  local file=".codex/config.toml"
  mkdir -p .codex
  backup_if_exists "$file"

  python3 - "$file" <<'PY'
import os
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text() if path.exists() else ""
lines = text.splitlines()

def find_section(lines, name):
    header = f"[{name}]"
    start = None
    for i, line in enumerate(lines):
        if line.strip() == header:
            start = i
            break
    if start is None:
        return None, None
    end = len(lines)
    for j in range(start + 1, len(lines)):
        s = lines[j].strip()
        if s.startswith("[") and s.endswith("]"):
            end = j
            break
    return start, end

# Hooks are a stable, default-on Codex feature; no [features] flag needed.
# Replace only our sections; leave all other config untouched.
rtk_data = Path(os.environ.get("XDG_DATA_HOME") or Path.home() / ".local/share") / "rtk"
blocks = {
    # Overrides the global ~/.codex/config.toml entry, which the Codex desktop app rewrites.
    "mcp_servers.serena": [
        'startup_timeout_sec = 30',
        'command = "serena"',
        'args = ["start-mcp-server", "--project-from-cwd", "--context=codex"]',
        'env = { SERENA_USAGE_REPORTING = "false" }',
    ],
    # `rtk hook codex` runs inside the workspace-write sandbox; without its data dir
    # writable, `rtk recall <hash>` (the way back to elided output) has nothing to read.
    "sandbox_workspace_write": [
        f'writable_roots = ["{rtk_data}"]',
    ],
}
for name, body in blocks.items():
    block = [f"[{name}]", *body]
    s, e = find_section(lines, name)
    if s is None:
        if lines and lines[-1].strip():
            lines.append("")
        lines.extend(block)
    else:
        lines[s:e] = block + ([""] if e < len(lines) else [])

path.write_text("\n".join(lines).rstrip() + "\n")
PY
}

# Replace the marked Persian editorial block in an agent instruction file, or
# append it. Everything outside the markers stays hand-owned.
upsert_editorial_block() {
  local file="$1"
  backup_if_exists "$file"

  EDITORIAL_BLOCK="$EDITORIAL_BLOCK" python3 - "$file" <<'PY'
import os
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
block = os.environ["EDITORIAL_BLOCK"].strip()
text = path.read_text() if path.exists() else ""
pattern = re.compile(
    r"<!-- PERSIAN_EDITORIAL_ENGINE_START -->.*?<!-- PERSIAN_EDITORIAL_ENGINE_END -->", re.S
)
if pattern.search(text):
    text = pattern.sub(lambda _: block, text, count=1)
else:
    text = (text.rstrip() + "\n\n" if text.strip() else "") + block
path.write_text(text.rstrip() + "\n")
PY
}

# ---------------------------------------------------------------------------
# 1) Verify the transparent Headroom layer
# ---------------------------------------------------------------------------

log "Checking Headroom"
if command -v headroom >/dev/null 2>&1; then
  headroom --version || true
  ok "Headroom found. This script does not replace your existing proxy/provider config."
else
  warn "Headroom is not on PATH. The rest of the stack can still be configured."
fi

# ---------------------------------------------------------------------------
# 2) Graphify: project-scoped skills + graph + post-commit incremental updates
# ---------------------------------------------------------------------------

log "Configuring Graphify"
ensure_graphify
graphify --version || true

# AGENTS.md section only. Claude Code also reads AGENTS.md, so `graphify claude
# install` would just duplicate it into a new CLAUDE.md (double context cost).
backup_if_exists "AGENTS.md"
graphify codex install
# The git hooks already rebuild on commit/checkout; per-edit updates are wasted tool calls.
sed -i 's/^- After modifying code, run `graphify update .` to keep the graph current.*$/- Do not run `graphify update .` after edits (git hooks rebuild on commit\/checkout). Run it only after pull\/merge or when the graph is stale./' AGENTS.md
graphify hook install
# graphify-out/ is untracked, so its graph.json merge driver entry is dead weight.
if [[ "$(cat .gitattributes 2>/dev/null)" == "graphify-out/graph.json merge=graphify" ]]; then
  rm .gitattributes
fi

log "Building/updating Graphify graph (AST only, no LLM calls)"
graphify update .

# ---------------------------------------------------------------------------
# 3) RTK: shell-output compaction
# ---------------------------------------------------------------------------

log "Configuring RTK"
ensure_rtk

# Every client rewrites transparently, so agents run commands plainly (AGENTS.md):
#   Claude  `rtk hook claude`  -> settings.local.json, unless the global settings has it
#   Codex   `rtk hook codex`   -> .codex/hooks.json (+ sandbox writable root, below)
#   Copilot `rtk hook copilot` -> .github/hooks/ai-stack.json
# Skip `rtk init --codex/--copilot`: their RTK.md / copilot-instructions.md
# duplicate AGENTS.md (and @RTK.md double-loads for Claude).

rtk gain || true

# ---------------------------------------------------------------------------
# 4) Serena: install, project index, MCP wiring, lifecycle hooks
# ---------------------------------------------------------------------------

log "Configuring Serena"
ensure_serena

if [[ ! -f ".serena/project.yml" ]]; then
  log "Creating Serena project (Vue + TypeScript)"
  SERENA_USAGE_REPORTING=false \
    serena project create --name "$PROJECT_NAME" --language vue "$ROOT"
else
  ok "Existing .serena/project.yml preserved."
fi

log "Indexing Serena symbols"
SERENA_USAGE_REPORTING=false serena project index "$ROOT"

# Claude Code: local-scope MCP (~/.claude.json, this repo only, not committed).
if command -v claude >/dev/null 2>&1; then
  log "Registering Serena MCP for Claude Code (local scope)"
  claude mcp remove serena --scope local >/dev/null 2>&1 || true
  # Name before --env: the flag is variadic and would swallow it.
  claude mcp add serena \
    --scope local \
    --env SERENA_USAGE_REPORTING=false \
    -- \
    serena start-mcp-server \
      --context claude-code \
      --project-from-cwd

  merge_json_hooks ".claude/settings.local.json" "claude"
else
  warn "Claude CLI not found; skipped Claude MCP registration. Graphify/RTK project files remain configured."
fi

# Codex: project-scoped config is supported by current Codex and keeps mohetios
# isolated from unrelated repositories.
if command -v codex >/dev/null 2>&1; then
  log "Registering Serena MCP for Codex (project scope)"
  upsert_codex_project_config
  merge_json_hooks ".codex/hooks.json" "codex"
else
  warn "Codex CLI not found; skipped Codex MCP config. Graphify/RTK project files remain configured."
fi

# VS Code Copilot (built into VS Code): reads AGENTS.md by default, so only
# MCP + hooks are needed. Hooks go in .github/hooks (read by default); VS Code
# ignores matchers, so each command must pass through tools it doesn't handle
# (both do). Leave chat.useClaudeHooks off, or the Claude hooks would run here too.
# No Headroom: Copilot traffic goes to GitHub, not through the proxy.
log "Configuring VS Code Copilot (Serena MCP + RTK/Serena hooks)"
mkdir -p .vscode .github/hooks
cat > .vscode/mcp.json <<'JSON'
{
  "servers": {
    "serena": {
      "type": "stdio",
      "command": "serena",
      "args": ["start-mcp-server", "--context", "vscode", "--project", "${workspaceFolder}"],
      "env": { "SERENA_USAGE_REPORTING": "false" }
    }
  }
}
JSON
cat > .github/hooks/ai-stack.json <<'JSON'
{
  "version": 1,
  "hooks": {
    "SessionStart": [{ "type": "command", "command": "serena-hooks activate --client=vscode", "timeout": 5 }],
    "PreToolUse": [
      { "type": "command", "command": "rtk hook copilot", "timeout": 5 },
      { "type": "command", "command": "serena-hooks remind --client=vscode", "timeout": 5 }
    ],
    "SessionEnd": [{ "type": "command", "command": "serena-hooks cleanup --client=vscode", "timeout": 5 }]
  }
}
JSON

# Keep per-machine artifacts local-only.
mkdir -p .git/info
for p in .ai/setup-backups/ .codex/ .serena/ graphify-out/ .github/hooks/ .vscode/mcp.json; do
  grep -qxF "$p" .git/info/exclude 2>/dev/null || printf '%s\n' "$p" >> .git/info/exclude
done

# ---------------------------------------------------------------------------
# 5) Persian editorial engine: one bridge text for every agent
# ---------------------------------------------------------------------------

# editorial/fa/ is canonical; agent files only point at it. Codex, Copilot,
# Cursor and Windsurf read AGENTS.md; Claude Code reads CLAUDE.md, Gemini GEMINI.md.
# Don't add per-tool rule files: they drift from this block.
log "Configuring Persian editorial engine"
command -v python3 >/dev/null 2>&1 || die "python3 is required for editorial tooling."

EDITORIAL_BLOCK="$(cat <<'MD'
<!-- PERSIAN_EDITORIAL_ENGINE_START -->

## Persian editorial engine

For any task that creates, rewrites, translates, localizes, audits, or updates Persian-language output:

1. Read `editorial/fa/ENTRYPOINT.md` and follow its load order: `core.md` and `profiles/ali/voice.md` always, then only the relevant parts of `reference.md` and the nearest scoped context.
2. Use `editorial/fa/profiles/ali/` as the default author profile unless the task explicitly selects another one.
3. Preserve factual meaning, temporal status, ownership, uncertainty, frontmatter, URLs, code, identifiers, placeholders, and runtime-sensitive Markdown.
4. Keep project facts, timelines, terminology, and status out of `editorial/fa/`.
5. Run `pnpm editorial:check` before completion.

Do not duplicate the editorial rules here; `editorial/fa/` is canonical. This block is managed by `scripts/setup-ai-coding-stack.sh`.

<!-- PERSIAN_EDITORIAL_ENGINE_END -->
MD
)"

for f in AGENTS.md CLAUDE.md GEMINI.md; do
  upsert_editorial_block "$f"
done

python3 editorial/fa/tooling/validate_kit.py || warn "Editorial engine validation failed; see above."

# ---------------------------------------------------------------------------
# 6) Health checks
# ---------------------------------------------------------------------------

log "Health checks"

graphify hook status || warn "Graphify post-commit hook status check failed."
SERENA_USAGE_REPORTING=false \
  serena project health-check "$ROOT" || warn "Serena health-check reported an issue; inspect its output above."

if command -v claude >/dev/null 2>&1; then
  claude mcp get serena || warn "Claude does not currently report the Serena MCP server."
fi

if command -v codex >/dev/null 2>&1; then
  codex mcp list || warn "Could not list Codex MCP servers."
fi

log "Done"
cat <<'EOF'

Expected runtime behavior:

  architecture/docs question
      -> Graphify
      -> narrow modules/files
      -> inspect real source

  symbol/reference/refactor question
      -> Serena
      -> symbol/reference tools
      -> symbol-aware edit

  shell/test/lint/diff output
      -> RTK hook (Claude, Codex, Copilot)
      -> compact context

  Persian prose (create/edit/translate/audit)
      -> editorial/fa/ENTRYPOINT.md
      -> core + Ali voice + scoped context
      -> pnpm editorial:check

  provider/context/cache traffic
      -> existing Headroom layer
      -> Anthropic / OpenAI

Restart Claude Code / Codex (and the VS Code extension hosts) after this first setup
so MCP servers and lifecycle hooks are reloaded.

Codex skips project hooks until trusted, and any edit to .codex/hooks.json
re-requires it: open the Codex TUI in this repo and approve them under /hooks.

Useful checks:
  graphify hook status
  rtk gain
  serena project health-check .
  claude mcp get serena
  codex mcp list
  pnpm editorial:check

The Graphify post-commit hook incrementally follows code changes. After large
refactors that delete code, run:
  graphify update . --force
EOF
