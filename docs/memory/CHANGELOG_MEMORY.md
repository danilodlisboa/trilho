# 📜 Commit & Feature Memory History (CHANGELOG_MEMORY.md)

This document records the chronological history of features, bug fixes, architecture changes, and commits in the **Trilho** repository.

---

## 📅 2026-08-03

### 🔐 Ported Business Rules, Security Authorization & Invitation System from `trilho_python`
- **Strict Board Owner Authorization**: Enforced owner identity check on `GET /api/boards/[boardId]` (403 for non-members), `PUT /api/boards/[boardId]` (403 for non-owners), and `DELETE /api/boards/[boardId]` (403 for non-owners, with cascade column and card deletion).
- **Board Invitations System**:
  - Updated `Board` schema model (`src/models/Board.ts`) to store `invitations: [BoardInvitationSchema]`.
  - Added email invitation endpoint `POST /api/boards/[boardId]/invitations` (owner-only, validating self-invites, existing members, and duplicate pending invites).
  - Added pending invitations query endpoint `GET /api/boards/invitations/pending`.
  - Added accept invitation endpoint `POST /api/boards/[boardId]/invitations/accept` and decline invitation endpoint `POST /api/boards/[boardId]/invitations/decline`.
  - Added member removal & invitation cancelation endpoint `DELETE /api/boards/[boardId]/members/[identifier]` (owner-only, protecting board owner).
- **Strict Assignee Validation**: Enforced that card assignees on `POST /api/cards` and `PUT /api/cards` must be accepted board members (`400 Bad Request` if unconfirmed user is assigned).
- **UI & State Integrations**:
  - Updated `useKanbanStore.ts` with `pendingInvitations` state, `fetchPendingInvitations()`, `inviteMember()`, `acceptInvitation()`, `declineInvitation()`, and `removeMemberOrInvite()`.
  - Updated `Navbar.tsx` to restrict inline board title editing to board owner and filter assignee dropdown to active board members.
  - Updated `Sidebar.tsx` to display pending invitation badges with Accept/Decline action buttons, restrict board deletion to board owner, and provide an inline email invitation form and member removal list for board owners.
  - Updated `CardDetailModal.tsx` to restrict assignee selection options to accepted board members.
- **Unit Test Coverage**: Updated `boardId.test.ts` and `cards.test.ts` to test owner authorization checks and strict member assignee validation.
- **🐛 Fix Vertical Card Reordering State Reversion**:
  - Added `.sort((a, b) => a.order - b.order)` to `getFilteredCardsForColumn` in `KanbanBoard.tsx`.
  - Updated `moveCardOptimistic` in `useKanbanStore.ts` to re-sort `allCards` by `order` when updating store state, preventing optimistic UI reorder reversion.
  - Added unit test case for same-column vertical card reordering in `useKanbanStore.test.ts`.

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
