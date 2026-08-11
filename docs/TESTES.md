# 🧪 Fullstack Testing Guide - Trilho

This document outlines the testing architecture, framework configuration, test suite structure, and execution guidelines for **Trilho**.

---

## 🏛️ 1. Testing Architecture & Stack

Trilho utilizes a multi-layered testing strategy covering unit, integration, and browser end-to-end (E2E) testing.

| Layer | Framework & Libraries | Description |
| :--- | :--- | :--- |
| **Unit Test Runner** | `vitest` | Modern, lightning-fast ESM & TypeScript native runner |
| **DOM Environment** | `jsdom` | Simulated browser DOM environment for UI components |
| **Component Testing** | `@testing-library/react` + `@testing-library/jest-dom` | React component rendering, user events, and custom matchers |
| **Store Testing** | `vitest` + `useKanbanStore` | Direct Zustand state store manipulation and async flow verification |
| **API Route Testing** | `vitest` + Next.js App Router Handlers | Importing `GET`/`POST`/`PUT`/`DELETE` handlers with `NextRequest` and mocked Mongoose models |
| **End-to-End (E2E)** | `@playwright/test` | Chromium browser automated testing for complete user auth and navigation flows |

---

## 📁 2. Test Suite Directory Structure

Tests are co-located with their corresponding modules in `__tests__` subdirectories, along with top-level `e2e/`:

```
e2e/
├── login.spec.ts                       # Playwright E2E browser authentication & navigation suite (2 tests)
└── board-card.spec.ts                  # Playwright E2E operations suite: create boards, edit boards, create cards, edit cards (4 tests)
src/
├── app/
│   └── api/
│       └── __tests__/
│           ├── register.test.ts                  # POST /api/register unit tests
│           ├── loginCheck.test.ts                # POST /api/auth/login-check pre-check unit tests
│           ├── emailVerification.test.ts         # Account activation token unit tests
│           ├── middlewareSecurityHeaders.test.ts # Nonce CSP & HTTP Security Headers middleware unit tests
│           ├── boards.test.ts                    # GET/POST /api/boards unit tests
│           ├── boardId.test.ts                   # GET/PUT/DELETE /api/boards/[boardId] owner authorization unit tests
│           ├── customFields.test.ts              # Board custom fields CRUD unit tests
│           ├── columns.test.ts                   # POST/PUT/DELETE /api/columns unit tests
│           ├── columnsReorder.test.ts            # POST /api/columns/reorder horizontal drag-and-drop unit tests
│           ├── cards.test.ts                     # POST/PUT/DELETE /api/cards & assignee validation unit tests
│           ├── cardsReorder.test.ts              # POST /api/cards/reorder vertical/cross-column batch unit tests
│           └── users.test.ts                     # GET /api/users unit tests
├── components/
│   ├── kanban/
│   │   └── __tests__/
│   │       ├── KanbanCard.test.tsx               # KanbanCard UI component unit tests
│   │       └── KanbanColumn.test.tsx             # KanbanColumn UI component unit tests
│   └── modals/
│       └── __tests__/
│           ├── CreateBoardModal.test.tsx        # CreateBoardModal unit tests
│           └── CardDetailModal.test.tsx          # CardDetailModal unit tests
├── models/
│   └── __tests__/
│       ├── User.test.ts                        # User model schema unit tests
│       ├── Board.test.ts                       # Board model schema unit tests
│       ├── Column.test.ts                      # Column model schema unit tests
│       └── Card.test.ts                        # Card model schema unit tests
└── store/
    └── __tests__/
        └── useKanbanStore.test.ts              # Comprehensive Zustand store & optimistic UI unit tests
```

---

## 🏃 3. Executing Test Suites

Run tests using npm scripts from the root directory:

### Run Unit & Integration Test Suite Once
```bash
npm run test
```

### Run Unit Tests in Watch Mode (Interactive Development)
```bash
npm run test:watch
```

### Generate Code Coverage Report
```bash
npm run test:coverage
```

### Run Playwright Browser E2E Tests
```bash
npm run test:e2e
```

---

## ⚙️ 4. Configuration & Setup Files

- **[`vitest.config.mts`](../vitest.config.mts)**: Configures `jsdom` environment, `@vitejs/plugin-react`, setup files, and `resolve.tsconfigPaths` for `@/*` path alias resolution.
- **[`vitest.setup.ts`](../vitest.setup.ts)**: Extends Vitest's `expect` matchers with `@testing-library/jest-dom/vitest`.
- **[`playwright.config.ts`](../playwright.config.ts)**: Configures Playwright runner, base URL, webServer auto-start (`npm run dev`), and chromium browser setup.

---

## 📝 5. Guidelines for Writing New Tests

### Component Unit Tests (`*.test.tsx`)
1. Wrap component state updates or user events in `act` or `userEvent` when necessary.
2. Mock external dependencies like `@hello-pangea/dnd` or Next.js navigation hooks if required.
3. Test key user interactions, conditional elements (e.g., priority badges, custom field tags, overdue dates), and store triggers.

### Store Unit Tests (`*.test.ts`)
1. Reset the Zustand store state in `beforeEach` via `useKanbanStore.setState(...)`.
2. Mock global `fetch` calls using `vi.fn().mockResolvedValue(...)`.

### API Route Unit Tests (`*.test.ts`)
1. Mock `@/auth` and Mongoose models (`User`, `Board`, `Column`, `Card`, `CustomFieldDefinition`).
2. Construct mock `Request` objects and invoke exported HTTP route handlers directly (`GET(req)`, `POST(req)`, `PUT(req)`, `DELETE(req)`).
3. Assert on response HTTP status codes (`res.status`) and JSON body payloads (`await res.json()`).

### E2E Tests (`e2e/*.spec.ts`)
1. Use role-based locators (`getByRole('heading', { name: 'Trilho' })`) to avoid strict mode ambiguity.
2. Set explicit wait conditions (`page.waitForURL(..., { waitUntil: 'commit' })`) on Next.js App Router client-side navigation.

