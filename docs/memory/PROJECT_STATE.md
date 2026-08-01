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

## 📂 Key Modules & Component Map
- **`/src/app/api`**: REST Endpoints (`/api/register`, `/api/users`, `/api/boards`, `/api/columns`, `/api/cards`, `/api/seed`).
- **`/src/app/board/[id]`**: Main interactive Kanban Board page.
- **`/src/app/dashboard`**: Workspace redirect & overview.
- **`/src/app/login` & `/src/app/register`**: Authentication pages with instant demo seed trigger.
- **`/src/components/kanban`**: Components `KanbanBoard`, `KanbanColumn`, `KanbanCard`.
- **`/src/components/modals`**: Modals for card details (`CardDetailModal`) with checklist and assignee selector, and board creation (`CreateBoardModal`).
- **`/src/store/useKanbanStore.ts`**: Zustand store centralizing board state, card state, filters, and save status tracking.
- **`/src/lib/db.ts`**: Mongoose connection pooling for serverless environments.

## 🔄 Repository Status
- Fully functional app with default Dark Mode.
- Fully localized in English (UI, API errors, schemas, seed data, and documentation).
- Clean code free from mocked local absolute paths.
- 100% generic icons without third-party trademark logos.
