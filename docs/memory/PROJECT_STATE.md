# 📌 Current Project State (PROJECT_STATE.md)

**Last Updated:** 2026-08-03

---

## 🚀 System Overview
**Trilho** is a fullstack NoSQL Kanban project management system built with reactive architecture, strict security authorization, board invitation workflows, confirmed member assignee restrictions, and optimistic local state updates. Entirely localized in English.

## 🛠️ Current Tech Stack
- **Framework:** Next.js v15.1 (App Router)
- **Language:** TypeScript v5.7
- **UI & Styling:** Tailwind CSS v3.4 + `lucide-react` (Generic icon set, e.g., `Kanban`)
- **Local State & Optimistic UI:** Zustand v5.0
- **Database & ODM:** MongoDB v7+ via Mongoose v8.9
- **Authentication:** Auth.js v5 (`@auth/nextjs`) + `bcryptjs`
- **Drag-and-Drop:** `@hello-pangea/dnd` v18.0.1 (React 19 compatible)
- **Testing Framework:** Vitest + React Testing Library + JSDOM

## 📂 Key Modules & Component Map
- **`/src/app/api`**: REST Endpoints (`/api/register`, `/api/users`, `/api/boards`, `/api/boards/[boardId]`, `/api/boards/[boardId]/invitations`, `/api/boards/invitations/pending`, `/api/columns`, `/api/cards`) & unit tests in `/src/app/api/__tests__`.
- **`/src/app/board/[id]`**: Main interactive Kanban Board page.
- **`/src/app/dashboard`**: Workspace redirect & overview.
- **`/src/app/login` & `/src/app/register`**: Authentication pages.
- **`/tools`**: External database management CLI scripts (`tools/seed.ts` via `npm run db:seed` and `tools/clean.ts` via `npm run db:clean`).
- **`/src/components/kanban`**: Components `KanbanBoard`, `KanbanColumn`, `KanbanCard` & unit tests in `__tests__`.
- **`/src/components/modals`**: Modals for card details (`CardDetailModal`) and board creation (`CreateBoardModal`) & unit tests in `__tests__`.
- **`/src/store/useKanbanStore.ts`**: Zustand store centralizing board state, card state, pending invitations, member management actions, filters, and save status tracking.
- **`/src/lib/db.ts`**: Mongoose connection pooling for serverless environments.
- **`/docs`**: Core project documentation (`ARCHITECTURE.md`, `DATABASE.md`, `AUTHENTICATION.md`, `API.md`, `TESTES.md`, `GETTING_STARTED.md`).

## 🔄 Repository Status
- Fully functional app with default Dark Mode and zero layout shift.
- Fully localized in English (UI, API errors, schemas, seed data, and documentation).
- Strict **Board Owner Authorization** enforced (`403 Forbidden` for non-owners attempting to edit title/description or delete board).
- Complete **Board User Invitation System**: email invitations, pending invitations list in sidebar, accept/decline flows, and owner member removal.
- **Confirmed Member Assignee Validation**: cards can only be assigned to accepted board members (`400 Bad Request` if unconfirmed).
- Comprehensive fullstack unit testing suite with Vitest.
- Clean code free from hardcoded absolute paths.
