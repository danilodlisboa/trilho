# 📜 Commit & Feature Memory History (CHANGELOG_MEMORY.md)

This document records the chronological history of features, bug fixes, architecture changes, and commits in the **Trilho** repository.

---

## 📅 2026-08-07

### 📏 Enforce Strict Relative Paths Rule (`AGENTS.md`, `docs/memory/USER_DIRECTIVES.md`)
- **Mandatory Relative Paths Rule**: Registered a strict project directive prohibiting absolute file paths in documentation, comments, markdown files, and memory logs. All path references must use clean relative paths.

### 🎨 Responsive Navbar Layout for Mobile Screens (`src/components/layout/Navbar.tsx`)
- **Prevented Mobile Overflow**: Applied responsive flex bounds (`overflow-hidden`, `min-w-0`, `shrink-0`, `max-w-[45%]`) to prevent header controls from clipping or overflowing on narrow viewports (e.g., Pixel 10 mobile size 412px).
- **User Profile Dropdown Visibility**: Removed `overflow-hidden` container clipping from `<header>` element and added backdrop overlay so clicking the user profile picture opens the user options modal cleanly on all screen sizes.

### 🐛 Fix Infinite Redirection Loop ("Redirecting to login...") (`src/middleware.ts`, `src/app/dashboard/page.tsx`, `src/app/board/[id]/page.tsx`)
- **Resolved Middleware Loop**: Removed aggressive cookie check in `middleware.ts` that bounced unauthenticated sessions trying to access `/login` back to `/dashboard`, breaking the infinite redirect loop.
- **Clean Hard Navigation**: Updated `DashboardPage` and `BoardPage` to use `window.location.href = '/login'` when `status === 'unauthenticated'`, guaranteeing a clean reset to the login page without getting stuck.

### 🏷️ UI Text & Branding Adjustments (`src/components/layout/Sidebar.tsx`, `src/components/layout/Navbar.tsx`, `src/store/useKanbanStore.ts`)
- **Removed NoSQL Badge**: Removed the `'NoSQL'` badge pill from the Trilho title in `src/components/layout/Sidebar.tsx`.
- **Removed Dark Mode Toggle**: Removed `isDarkMode` state, `toggleTheme` function, and theme toggle button from `src/components/layout/Navbar.tsx`.

### 📱 Responsive Off-Canvas Mobile Drawer & Header Expand Toggle (`src/components/layout/Sidebar.tsx`, `src/components/layout/Navbar.tsx`)
- **Off-Canvas Mobile Drawer (`-translate-x-full md:translate-x-0`)**: Configured sidebar to hide completely off-screen on small screens (`< md`) when contracted, with a smooth slide-in transition over a semi-transparent backdrop overlay when expanded.
- **Header Expansion Toggle Button (`Navbar.tsx`)**: Added a sidebar toggle button (`PanelLeft`) at the far left of the header bar, allowing users to expand and collapse the sidebar from both mobile header and desktop.
- **Auto-Close on Selection**: Automatically closes the mobile off-canvas drawer when a board is selected on mobile screens.

### 🎨 Sidebar Board Custom Fields & Manage Trigger Migration (`src/components/layout/Sidebar.tsx`, `src/components/kanban/KanbanBoard.tsx`)
- **Moved Manage Board Fields Button**: Relocated the "Manage Board Fields" trigger button from the main `KanbanBoard` canvas top bar to a dedicated **Board Fields** section in the `Sidebar`.
- **Top 5 Custom Fields Sidebar Preview**: Rendered a preview listing the first 5 custom fields (`customFields.slice(0, 5)`) for the active board directly inside the sidebar with type tags and default indicators.

### 🐛 Fix Login Alert for Unverified User Accounts (`src/app/api/auth/login-check/route.ts`, `src/app/login/page.tsx`)
- **Login Credentials & Verification Pre-check Endpoint (`/api/auth/login-check`)**: Implemented pre-check endpoint to validate user password before inspecting `isVerified`. Returns status `403 Forbidden` with `UNVERIFIED_EMAIL` error code if credentials are correct but email is unverified.
- **Explicit Unverified Email Alert & Inline Resend Action (`src/app/login/page.tsx`)**: Updated `LoginPage` to intercept `UNVERIFIED_EMAIL` status and display an amber warning alert (`"Account email not verified. Please check your inbox or resend verification email."`) with an instant **"Resend Activation Email"** action button instead of generic `"Invalid email or password."`.
- **Unit Test Coverage (`src/app/api/__tests__/loginCheck.test.ts`)**: Added unit test suite for `/api/auth/login-check`.

### 🚀 Full Alignment of Product Specifications & Business Logic from `trilho_python`
- **Account Email Verification System (`src/models/User.ts`, `src/lib/tokens.ts`, `src/lib/email.ts`, `src/app/api/auth/verify-email`, `src/app/api/auth/resend-verification`)**:
  - Added `isVerified: boolean` (default `false`) to `UserSchema` and `IUser` interface.
  - Implemented HMAC SHA256 base64url signed token generation (24h validity) in `src/lib/tokens.ts`.
  - Added `sendEmail` service in `src/lib/email.ts` with Resend API and SMTP sender identity (`SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`, `RESEND_API_KEY`) matching `trilho_python` environment settings.
  - Updated `src/auth.ts` to block unverified account authentication (`403 Forbidden`).
  - Updated `src/app/api/register/route.ts` to set `isVerified: false` and dispatch an account activation link email.
  - Created Web UI pages `/verify-email` and `/resend-verification` and updated `/login` page with resend activation links.
  - Created integration test suite `src/app/api/__tests__/emailVerification.test.ts`.
- **Password Recovery via Email System (`src/lib/tokens.ts`, `src/app/api/auth/forgot-password`, `src/app/api/auth/reset-password`)**:
  - Implemented 15-minute signed JWT password reset tokens in `src/lib/tokens.ts`.
  - Added REST API routes `/api/auth/forgot-password` and `/api/auth/reset-password`.
  - Created Web UI pages `/forgot-password` and `/reset-password` and added "Forgot password?" link to `/login`.
- **Board-Scoped Custom Fields Management System (`src/models/CustomFieldDefinition.ts`, `src/models/Card.ts`, `src/app/api/boards/[boardId]/custom-fields`, `src/store/useKanbanStore.ts`)**:
  - Created `CustomFieldDefinition` model (`boardId`, `name`, `fieldType`: `'text' | 'number' | 'select' | 'date'`, `options`, `isDefault`, `defaultValue`).
  - Embedded `customFields: [{ fieldId, value }]` in `Card` model.
  - Enforced strict board member access check (`403 Forbidden` for non-members) and cross-board field isolation (`400 Bad Request` if field ID belongs to another board).
  - Implemented default custom field auto-attachment on card creation (`POST /api/cards`).
  - Created `DefaultFieldsModal.tsx` for managing board custom fields and default values.
  - Integrated custom field value editing, attaching, and detaching in `CardDetailModal.tsx`.
  - Rendered custom field tag badges on Kanban cards in `KanbanCard.tsx`.
  - Added integration test suite `src/app/api/__tests__/customFields.test.ts`.
- **Datetime Selection for Card Due Dates (`src/components/modals/CardDetailModal.tsx`, `src/components/kanban/KanbanCard.tsx`)**:
  - Updated card modal due date control from standard date picker (`type="date"`) to HTML5 datetime picker (`type="datetime-local"`), saving date + time.
  - Updated `KanbanCard.tsx` due date badge rendering to format date and time (e.g. `Feb 10, 14:30`).
- **Horizontal Column Drag-and-Drop Reordering (`src/app/api/columns/reorder/route.ts`, `src/store/useKanbanStore.ts`, `src/components/kanban/KanbanBoard.tsx`, `src/components/kanban/KanbanColumn.tsx`)**:
  - Added batch column reordering API route `POST /api/columns/reorder`.
  - Added `moveColumnOptimistic` in Zustand store.
  - Enabled `@hello-pangea/dnd` horizontal column drag-and-drop reordering in `KanbanBoard` and `KanbanColumn`.
  - Added integration test suite `src/app/api/__tests__/columnsReorder.test.ts`.
- **Database Utilities & Seeding Script Updates (`tools/seed.ts`)**:
  - Updated `tools/seed.ts` to set `isVerified: true` for demo users and seed default custom fields (`Environment`, `Story Points`) bound to demo board.

### 🐛 TypeScript Build Fix for Card Reordering API & Navbar/Sidebar
- **BulkWrite Operation Type Alignment (`src/app/api/cards/reorder/route.ts`)**: Resolved Next.js build type compilation error (`AnyBulkWriteOperation<ICard>`) by safely mapping `columnId` to `mongoose.Types.ObjectId` via `mongoose.Types.ObjectId.isValid()`.
- **Session User Type Guarding (`src/components/layout/Navbar.tsx`)**: Extracted `userId` and `userEmail` constants from `session?.user` to resolve closure type narrowing error (`'session.user' is possibly 'undefined'`).
- **Sidebar Key Union Type Safety (`src/components/layout/Sidebar.tsx`)**: Resolved React JSX key type error (`Type 'string | IUserRef' is not assignable to type 'Key | null | undefined'`) by safely discriminating `member` in `typeof member === 'string'` union before extracting `memberId`, `memberName`, `memberEmail`, and `avatarUrl`.
- **Excluded CLI Tools from Build (`tsconfig.json`, `tools/clean.ts`)**: Added `"tools"` to the `"exclude"` list in `tsconfig.json` so CLI management scripts (`tools/clean.ts`, `tools/seed.ts`, `tools/deploy_gcp.ts`) are not included in Next.js production build checks. Added strict null-guarding for `mongoose.connection.db` in `tools/clean.ts`.
- **Unauthenticated Session & Page Guarding (`src/app/dashboard/page.tsx`, `src/app/board/[id]/page.tsx`, `src/store/useKanbanStore.ts`)**: Added `useSession()` status checks to `/dashboard` and `/board/[id]` pages and `isLoadingBoards` to Zustand store. If `status === 'unauthenticated'` or an API returns `401 Unauthorized`, unauthenticated users are immediately redirected to `/login` without ever flashing or rendering the "Create New Board" screen.
- **Fast DB Timeout & Connection Error State (`src/lib/db.ts`, `src/store/useKanbanStore.ts`, `src/app/dashboard/page.tsx`)**: Configured `serverSelectionTimeoutMS: 5000` and `dbName` in Mongoose connection options to fail fast on database connection issues instead of hanging for 30s. Added `fetchError` state and interactive **"Retry Connection"** button on `/dashboard` if database connection fails.
- **Runtime Environment Variable Deferral (`src/lib/db.ts`)**: Deferred `process.env.MONGODB_URI` evaluation from top-level module load time to runtime inside `connectToDatabase()`. Resolves GCP Cloud Build compilation failure when `next build` runs during container image creation before Cloud Run runtime environment variables are injected.
- **Node 24 Multi-Stage Dockerfile (`Dockerfile`, `next.config.mjs`, `.dockerignore`, `.gcloudignore`)**: Replaced Python/FastAPI Dockerfile with a security-hardened, non-root multi-stage `node:24-alpine` Dockerfile utilizing Next.js `output: 'standalone'` build optimization for GCP Cloud Run. Updated `.gcloudignore` and `.dockerignore` to ignore `node_modules` and `.next` build outputs during Cloud Build source upload.
- **Docker Build Missing `/app/public` Fix (`Dockerfile`, `public/.gitkeep`)**: Created `public/.gitkeep` directory placeholder and added `RUN mkdir -p public` in Stage 2 (`builder`) of `Dockerfile`. Resolves Docker layer failure `COPY --from=builder /app/public ./public: /app/public: not found` during local `docker build` and GCP Cloud Build container deployment.

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
