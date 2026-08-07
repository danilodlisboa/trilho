# 📜 Commit & Feature Memory History (CHANGELOG_MEMORY.md)

This document records the chronological history of features, bug fixes, architecture changes, and commits in the **Trilho** repository.

---

## 📅 2026-08-07

### 🐛 TypeScript Build Fix for Card Reordering API & Navbar/Sidebar
- **BulkWrite Operation Type Alignment (`src/app/api/cards/reorder/route.ts`)**: Resolved Next.js build type compilation error (`AnyBulkWriteOperation<ICard>`) by safely mapping `columnId` to `mongoose.Types.ObjectId` via `mongoose.Types.ObjectId.isValid()`.
- **Session User Type Guarding (`src/components/layout/Navbar.tsx`)**: Extracted `userId` and `userEmail` constants from `session?.user` to resolve closure type narrowing error (`'session.user' is possibly 'undefined'`).
- **Sidebar Key Union Type Safety (`src/components/layout/Sidebar.tsx`)**: Resolved React JSX key type error (`Type 'string | IUserRef' is not assignable to type 'Key | null | undefined'`) by safely discriminating `member` in `typeof member === 'string'` union before extracting `memberId`, `memberName`, `memberEmail`, and `avatarUrl`.
- **Excluded CLI Tools from Build (`tsconfig.json`, `tools/clean.ts`)**: Added `"tools"` to the `"exclude"` list in `tsconfig.json` so CLI management scripts (`tools/clean.ts`, `tools/seed.ts`, `tools/deploy_gcp.ts`) are not included in Next.js production build checks. Added strict null-guarding for `mongoose.connection.db` in `tools/clean.ts`.
- **Unauthenticated Session & Page Guarding (`src/app/dashboard/page.tsx`, `src/app/board/[id]/page.tsx`, `src/store/useKanbanStore.ts`)**: Added `useSession()` status checks to `/dashboard` and `/board/[id]` pages and `isLoadingBoards` to Zustand store. If `status === 'unauthenticated'` or an API returns `401 Unauthorized`, unauthenticated users are immediately redirected to `/login` without ever flashing or rendering the "Create New Board" screen.
- **Fast DB Timeout & Connection Error State (`src/lib/db.ts`, `src/store/useKanbanStore.ts`, `src/app/dashboard/page.tsx`)**: Configured `serverSelectionTimeoutMS: 5000` and `dbName` in Mongoose connection options to fail fast on database connection issues instead of hanging for 30s. Added `fetchError` state and interactive **"Retry Connection"** button on `/dashboard` if database connection fails.

---

## 📅 2026-08-03

### 🚀 Node.js GCP Cloud Run Deployment Script
- **TypeScript Deployment CLI (`tools/deploy_gcp.ts`)**: Implemented a GCP Cloud Run deployment script in Node/TypeScript matching Python's `deploy_gcp.py` behavior.
- **Environment & Interactive Prompts**: Reads environment variables from `.env.local` / `.env` via `dotenv`, overrides `NODE_ENV` / `ENVIRONMENT` to `production` and `ENABLE_SEED_ENDPOINT` to `false`, and interactively prompts for `GCP_PROJECT_ID` and `GCP_REGION` with defaults.
- **Distinct Service / Container Name**: Configured Cloud Run deployment to target container/service name `trilho-next` (distinct from Python's `trilho-app`), customizable via `GCP_CONTAINER_NAME` or `GCP_SERVICE_NAME`.
- **Package Script**: Added `"deploy:gcp": "tsx tools/deploy_gcp.ts"` to `package.json`.

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
