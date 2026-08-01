# 📌 Current Project State (PROJECT_STATE.md)

**Last Updated:** 2026-08-01

---

## 🚀 System Overview
**Trilho** is a fullstack NoSQL Kanban project management system built with reactive architecture and optimistic local state updates. Entirely localized in English.

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
- **`/src/app/api`**: REST Endpoints (`/api/register`, `/api/users`, `/api/boards`, `/api/columns`, `/api/cards`) & API unit tests in `/src/app/api/__tests__`.
- **`/src/app/board/[id]`**: Main interactive Kanban Board page.
- **`/src/app/dashboard`**: Workspace redirect & overview.
- **`/src/app/login` & `/src/app/register`**: Authentication pages.
- **`/tools`**: External database management CLI scripts (`tools/seed.ts` via `npm run db:seed` and `tools/clean.ts` via `npm run db:clean`).
- **`/src/components/kanban`**: Components `KanbanBoard`, `KanbanColumn`, `KanbanCard` & unit tests in `__tests__`.
- **`/src/components/modals`**: Modals for card details (`CardDetailModal`) and board creation (`CreateBoardModal`) & unit tests in `__tests__`.
- **`/src/store/useKanbanStore.ts`**: Zustand store centralizing board state, card state, filters, and save status tracking & unit tests in `useKanbanStore.test.ts`.
- **`/src/lib/db.ts`**: Mongoose connection pooling for serverless environments.
- **`/docs`**: Core project documentation (`ARCHITECTURE.md`, `DATABASE.md`, `AUTHENTICATION.md`, `API.md`, `TESTES.md`, `GETTING_STARTED.md`).

## 🔄 Repository Status
- Fully functional app with default Dark Mode.
- Fully localized in English (UI, API errors, schemas, seed data, and documentation).
- Comprehensive fullstack unit testing suite with Vitest passing 100% cleanly.
- Clean code free from mocked local absolute paths.
- 100% generic icons without third-party trademark logos.
