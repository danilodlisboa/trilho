# 📌 Current Project State (PROJECT_STATE.md)

**Last Updated:** 2026-08-07

---

## 🚀 System Overview
**Trilho** is a fullstack NoSQL Kanban project management system built with reactive architecture, strict security authorization, board invitation workflows, confirmed member assignee restrictions, account email verification, password recovery, board-scoped custom fields auto-attachment, horizontal column reordering, and optimistic local state updates. Entirely localized in English.

## 🛠️ Current Tech Stack
- **Framework:** Next.js v15.1 (App Router)
- **Language:** TypeScript v5.7
- **UI & Styling:** Tailwind CSS v3.4 + `lucide-react`
- **Local State & Optimistic UI:** Zustand v5.0
- **Database & ODM:** MongoDB v7+ via Mongoose v8.9
- **Authentication:** Auth.js v5 (`@auth/nextjs`) + `bcryptjs` + Signed Tokens (HMAC SHA256)
- **Email Dispatch:** Resend API / SMTP with local console fallback
- **Drag-and-Drop:** `@hello-pangea/dnd` v18.0.1 (React 19 compatible)
- **Testing Framework:** Vitest + React Testing Library + JSDOM

## 📂 Key Modules & Component Map
- **`/src/app/api`**: REST Endpoints (`/api/register`, `/api/auth/verify-email`, `/api/auth/resend-verification`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/users`, `/api/boards`, `/api/boards/[boardId]/custom-fields`, `/api/columns`, `/api/columns/reorder`, `/api/cards`) & integration tests in `/src/app/api/__tests__`.
- **`/src/app/board/[id]`**: Main interactive Kanban Board page.
- **`/src/app/login` & `/src/app/register`**: Authentication pages.
- **`/src/app/verify-email`, `/src/app/resend-verification`, `/src/app/forgot-password`, `/src/app/reset-password`**: Auth workflow pages.
- **`/tools`**: CLI management & deployment scripts (`tools/seed.ts` via `npm run db:seed`, `tools/clean.ts` via `npm run db:clean`, and `tools/deploy_gcp.ts` via `npm run deploy:gcp`).
- **`/src/components/kanban`**: Components `KanbanBoard`, `KanbanColumn`, `KanbanCard` & unit tests in `__tests__`.
- **`/src/components/modals`**: Modals for card details (`CardDetailModal`), board custom fields (`DefaultFieldsModal`), and board creation (`CreateBoardModal`) & unit tests in `__tests__`.
- **`/src/store/useKanbanStore.ts`**: Zustand store centralizing board state, custom fields, card state, pending invitations, member management actions, filters, and save status tracking.
- **`/src/lib/db.ts`**: Mongoose connection pooling for serverless environments.
- **`/src/lib/tokens.ts`**: HMAC SHA256 signed token generation & verification for email verification (24h) and password reset (15m).
- **`/src/lib/rateLimit.ts`**: IP-based in-memory rate limiting utility for sensitive authentication and API endpoints.
- **`/src/lib/email.ts`**: Email sending service with Resend API / SMTP / dev console logger fallback.
- **`/docs`**: Core project documentation (`ARCHITECTURE.md`, `DATABASE.md`, `AUTHENTICATION.md`, `API.md`, `TESTES.md`, `GETTING_STARTED.md`).

## 🔄 Repository Status
- Fully aligned with product features & business rules from `trilho_python`.
- **Account Email Verification System**: `isVerified` flag, 24h token verification, login blocking (`403`), and resend activation workflow.
- **PyJWT Password Recovery via Email System**: 15-min reset tokens, forgot/reset password pages and API endpoints.
- **Board-Scoped Custom Fields Management System**: Board-scoped metadata (`text`, `number`, `select`, `date`), cross-board security isolation, default auto-attachment on card creation, card modal editing, and card tag badges.
- **Datetime Selection for Card Due Dates**: HTML5 `<input type="datetime-local">` with date and time formatting on card badges.
- **Column Drag-and-Drop Reordering**: Horizontal column move with batch API persistence (`POST /api/columns/reorder`).
- Comprehensive fullstack unit testing suite with Vitest.
