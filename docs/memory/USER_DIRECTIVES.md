# 💡 User Directives & Extra-Code Context (USER_DIRECTIVES.md)

This document stores extra-code context, implicit business rules, design preferences, and directives provided by the user.

---

## 📌 Registered Directives & Decisions

### 1. English Localization (Trilho Repository)
- **100% English Language Standard:** Absolutely all user-facing UI text, API responses, seed datasets, database schemas, default column titles, priority levels, and technical documentation in `trilho` must be in English.

### 2. Environment Agnostic & Relative Paths
- **Strict Relative Paths Requirement:** NEVER use hardcoded absolute local paths (such as `file:///c:...`, `c:/Users/...`, or `C:\Users\...`) in documentation, markdown files, memory modules, test suites, or source code. Always use clean, environment-agnostic relative paths (e.g., `docs/ARCHITECTURE.md`, `vitest.config.mts`, `./.env.local`).
- **Generic Branding:** Use generic icons (`Kanban`) and brand name **Trilho**.

### 3. AI Agent Memory Protocol
- **Universal Agent Protocol:** Any AI Agent starting a session in this repository must read `AGENTS.md` and `docs/memory/` to absorb repository context.
- **Continuous Updates:** Update `CHANGELOG_MEMORY.md`, `PROJECT_STATE.md`, and `USER_DIRECTIVES.md` upon completing work.

### 4. Design & UX Standards
- **Default Dark Mode:** Sleek dark interface with Slate/Blue/Indigo palette and glassmorphism accents.
- **Optimistic UI Updates:** Zustand state updates immediately on drag-and-drop or card edits without waiting for server network responses.

### 5. Board Authorization & Member Management
- **Strict Board Owner Authorization:** Only board owners can edit board titles/descriptions (`PUT /api/boards/[boardId]`) or delete boards (`DELETE /api/boards/[boardId]`), returning `403 Forbidden` for non-owners.
- **Board Member Invitations:** Board owners invite users by email. Invited users can accept/decline pending invitations.
- **Confirmed Member Assignee Restrictions:** Cards can only be assigned to accepted board members (owner or confirmed members), returning `400 Bad Request` if unconfirmed.
- **No API Route Duplication:** All backend routes follow clean REST structure under `/api/boards` without creating redundant external API paths.
- **Zero Layout Shift:** Business rules and security enhancements must preserve all UI layout behavior and styling aesthetics.

### 6. Product Specification Alignment with `trilho_python`
- **Functional Parity:** `trilho` must maintain 100% product feature and business logic alignment with `trilho_python`, including Account Email Verification, PyJWT Password Recovery, Board-Scoped Custom Fields with default auto-attachment, Datetime card deadlines, and horizontal column drag-and-drop reordering.
- **Robust UI Preservation:** Design and UX enhancements in `trilho` are maintained as the primary design benchmark, focusing additions solely on functional capabilities and business logic constraints.
