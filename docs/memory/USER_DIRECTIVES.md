# 💡 User Directives & Extra-Code Context (USER_DIRECTIVES.md)

This document stores extra-code context, implicit business rules, design preferences, and directives provided by the user.

---

## 📌 Registered Directives & Decisions

### 1. English Localization (Trilho Repository)
- **100% English Language Standard:** Absolutely all user-facing UI text, API responses, seed datasets, database schemas, default column titles, priority levels, and technical documentation in `trilho` must be in English.

### 2. Environment Agnostic & Relative Paths
- **Strict Relative Paths Requirement:** NEVER use absolute file paths in documentation, comments, markdown files, or memory logs. ALWAYS use clean relative paths.
- **Generic Branding:** Use generic icons (`Kanban`) and brand name **Trilho**.

### 3. AI Agent Memory Protocol
- **Universal Agent Protocol:** Any AI Agent starting a session in this repository must read `AGENTS.md` and `docs/memory/` to absorb repository context.
- **Continuous Updates:** Update `CHANGELOG_MEMORY.md`, `PROJECT_STATE.md`, and `USER_DIRECTIVES.md` upon completing work.

### 4. Design & UX Standards
- **Visual Styling:** Sleek interface with Slate/Blue/Indigo palette and glassmorphism accents.
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

### 7. Mandatory Test Implementation, Execution & Verification Protocol
- **Always Test Code Changes:** Whenever implementing any new feature, architecture refactoring, or significant bug fix/correction, automated tests MUST be executed (`npm run test` for Vitest unit/integration tests and/or `npm run test:e2e` for Playwright browser E2E tests).
- **Mandatory Test Coverage:** If automated tests do not exist for the new functionality or modified code path, corresponding unit, API, or E2E tests MUST be written and implemented.
- **Collect & Evaluate Results:** The agent MUST inspect test execution logs and outputs.
- **Iterative Debugging Until Success:** If any test fails, the agent MUST evaluate the root cause, fix the code and/or the test assertions, and re-run until 100% test success is achieved before declaring the task finished.

### 8. LGPD Data Protection Suite Compliance Directive (Lei nº 13.709/2018)
- **Mandatory Consent & Transparency:** Registration (`/register`) requires explicit opt-in checkbox consent for Terms of Service (`/terms`) and Privacy Policy (`/privacy`), validated on both frontend and backend (`POST /api/register`).
- **Data Subject Rights Self-Service (`/profile`):** Users must be provided with self-service profile updating (`PUT /api/users/me`), structured JSON personal data export (`GET /api/users/me/export` - Art. 18, V), and account deletion (`DELETE /api/users/me` - Art. 18, VI).
- **Cascading Deletion & Ownership Transfer:** Account deletion (`DELETE /api/users/me`) must require email confirmation string verification. Sole-owned boards are deleted with all associated columns, cards, and custom field definitions; shared boards transfer ownership to the first remaining member. Assigned cards are unassigned (`assigneeId = null`) and member lists/invitations are scrubbed.

### 9. Card Modal Local State & Explicit Save Flow Directive
- **Local State Editing:** Card modifications inside `CardDetailModal` (title, description, priority, due date, assignee, custom fields, checklist) must be managed in local component state without sending network API requests per keystroke or field change.
- **Explicit Save & Close Button:** Changes are committed and the modal is closed when clicking the **Save & Close** button positioned at the far right corner of the header.
- **Optional Sub-tasks Checklist:** Cards without sub-tasks hide the checklist list and input form, rendering an `+ Add Sub-tasks Checklist` button. Clicking the button attaches the checklist and reveals the item list and input form. A detach icon in the checklist header allows detaching the checklist.
- **Header X Button Removal & Backdrop Closing Guard:** The 'X' close button is removed from the modal header. Closing via backdrop overlay click or Escape key triggers an unsaved changes confirmation dialog (`confirm(...)`) if local modifications (`isDirty`) exist. Confirming discards unsaved changes and closes the modal; canceling retains local modifications and keeps the modal open.

### 10. Git Commit Directive
- **No Automatic Commits to Main:** NEVER create git commits (`git commit`) directly on the `main` branch unless explicitly instructed or requested by the user.


