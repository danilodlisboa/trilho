# 📜 Commit & Feature Memory History (CHANGELOG_MEMORY.md)

This document records the chronological history of features, bug fixes, architecture changes, and commits in the **Trilho** repository.

---

## 📅 2026-08-01

### 🧪 Fullstack Unit Testing Suite Implementation (Vitest + React Testing Library)
- Installed `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `@vitejs/plugin-react`.
- Added `vitest.config.mts` and `vitest.setup.ts`.
- Created unit tests for Zustand store (`useKanbanStore.test.ts`).
- Created unit tests for React components (`KanbanCard.test.tsx`, `CreateBoardModal.test.tsx`).
- Created unit tests for Mongoose schema models (`User.test.ts`).
- Created unit tests for Next.js 15 API route handlers (`register.test.ts`, `boards.test.ts`).
- Created `docs/TESTES.md` documenting fullstack testing architecture, execution commands, and testing guidelines.
- Updated `README.md`, `docs/GETTING_STARTED.md`, and `docs/ARCHITECTURE.md` to reference `docs/TESTES.md` and include testing instructions.
- Registered explicit **Strict Relative Paths Requirement** rule in `docs/memory/USER_DIRECTIVES.md` and `AGENTS.md`.
- Expanded test coverage across all remaining backend models (`Board.ts`, `Column.ts`, `Card.ts`), API routes (`boardId`, `columns`, `cards`, `cardsReorder`, `users`), UI components (`KanbanColumn.tsx`, `CardDetailModal.tsx`), and Zustand store (`useKanbanStore.ts`). 56 unit tests passing.
- Removed `/api/seed` endpoint and UI seed trigger buttons from `src/app/login/page.tsx` and `src/app/dashboard/page.tsx`.
- Migrated seed functionality to external CLI script `tools/seed.ts` (`npm run db:seed`) and added database cleaner script `tools/clean.ts` (`npm run db:clean`).
- Configured root entry point (`/`) and middleware authentication guard to default to the Login page (`/login`) when unauthenticated.
- Added `<CreateBoardModal />` component mount to `src/app/dashboard/page.tsx` so the "Create New Board" button opens the modal prompt when a workspace has 0 boards.

## 📅 2026-07-31

### 🚀 Initial Fullstack Application Build
- Next.js (App Router), React 19, TypeScript, Tailwind CSS, Zustand, MongoDB/Mongoose, Auth.js v5.
