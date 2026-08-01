# 🤖 Agent Context Memory & System Directives — Trilho

This file establishes the **Universal Memory and Context Protocol** for any AI Agent (Antigravity, Claude, Codex, Cursor, Windsurf, Copilot, etc.) operating in the **Trilho** repository.

---

## 🧠 1. Agent Bootstrap Protocol

At each session start, task initialization, or new turn, the agent **MUST** execute the following steps before responding or modifying code:

1. **Context Load:**
   - Read [`AGENTS.md`](AGENTS.md) (this file).
   - Read current project state in [`docs/memory/PROJECT_STATE.md`](docs/memory/PROJECT_STATE.md).
   - Read user directives in [`docs/memory/USER_DIRECTIVES.md`](docs/memory/USER_DIRECTIVES.md).
   - Read recent changes history in [`docs/memory/CHANGELOG_MEMORY.md`](docs/memory/CHANGELOG_MEMORY.md).

2. **Context Validation:**
   - Ensure all code modifications and documentation adhere strictly to business rules in `USER_DIRECTIVES.md`.
   - **Relative Paths Rule:** NEVER write or commit absolute file paths (e.g. `file:///c:...`, `c:/Users/...`). Use clean relative paths everywhere.

---

## 📝 2. Continuous Context Persistence Protocol

Upon completing any modification, implementation, or decision, the agent **MUST update memory modules**:

1. **Changelog History (`docs/memory/CHANGELOG_MEMORY.md`):**
   - Record new features (*Features*).
   - Record bug fixes (*Bug Fixes*).
   - Record architecture & refactoring changes (*Architecture Changes*).

2. **User Directives & ADRs (`docs/memory/USER_DIRECTIVES.md`):**
   - Record business rules, UI/UX preferences, coding standards, or directives given by the user.
   - Record Architecture Decision Records (ADRs).

3. **Global Project State (`docs/memory/PROJECT_STATE.md`):**
   - Update component lists, schemas, or API routes if new modules were added.

---

## 📁 3. Memory System Structure

```
trilho/
├── AGENTS.md                          # Main Entry & Memory Protocol
└── docs/
    └── memory/                        # Agent Context Memory Modules
        ├── PROJECT_STATE.md           # Project Overview & Stack State
        ├── CHANGELOG_MEMORY.md        # Features, Commits, and Bug Fixes Log
        └── USER_DIRECTIVES.md         # Extra-Code Context & User Directives
```
