# 🧪 Fullstack Unit Testing Guide - Trilho

This document outlines the testing architecture, framework configuration, test suite structure, and execution guidelines for **Trilho**.

---

## 🏛️ 1. Testing Architecture & Stack

Trilho utilizes a unified, fast unit testing infrastructure powered by **Vitest**, **React Testing Library**, and **JSDOM**.

| Layer | Framework & Libraries | Description |
| :--- | :--- | :--- |
| **Test Runner** | `vitest` | Modern, lightning-fast ESM & TypeScript native runner |
| **DOM Environment** | `jsdom` | Simulated browser DOM environment for UI components |
| **Component Testing** | `@testing-library/react` + `@testing-library/jest-dom` | React component rendering, user events, and custom matchers |
| **Store Testing** | `vitest` + `useKanbanStore` | Direct Zustand state store manipulation and async flow verification |
| **API Route Testing** | `vitest` + Next.js App Router Handlers | Importing `GET`/`POST` handlers with `NextRequest` and mocked Mongoose models |

---

## 📁 2. Test Suite Directory Structure

Tests are co-located with their corresponding modules in `__tests__` subdirectories:

```
src/
├── app/
│   └── api/
│       └── __tests__/
│           ├── register.test.ts     # POST /api/register unit tests
│           ├── boards.test.ts       # GET/POST /api/boards unit tests
│           ├── boardId.test.ts      # GET/PUT/DELETE /api/boards/[boardId] unit tests
│           ├── columns.test.ts      # POST/PUT/DELETE /api/columns unit tests
│           ├── cards.test.ts        # POST/PUT/DELETE /api/cards unit tests
│           ├── cardsReorder.test.ts # POST /api/cards/reorder unit tests
│           ├── users.test.ts        # GET /api/users unit tests
│           └── seed.test.ts         # POST /api/seed unit tests
├── components/
│   ├── kanban/
│   │   └── __tests__/
│   │       ├── KanbanCard.test.tsx    # KanbanCard UI component unit tests
│   │       └── KanbanColumn.test.tsx  # KanbanColumn UI component unit tests
│   └── modals/
│       └── __tests__/
│           ├── CreateBoardModal.test.tsx # CreateBoardModal unit tests
│           └── CardDetailModal.test.tsx # CardDetailModal unit tests
├── models/
│   └── __tests__/
│       ├── User.test.ts             # User model schema unit tests
│       ├── Board.test.ts            # Board model schema unit tests
│       ├── Column.test.ts           # Column model schema unit tests
│       └── Card.test.ts             # Card model schema unit tests
└── store/
    └── __tests__/
        └── useKanbanStore.test.ts   # Comprehensive Zustand store unit tests
```

---

## 🏃 3. Executing Unit Tests

Run tests using npm scripts from the root directory:

### Run Full Test Suite Once
```bash
npm run test
```

### Run Tests in Watch Mode (Interactive Development)
```bash
npm run test:watch
```

### Generate Code Coverage Report
```bash
npm run test:coverage
```

---

## ⚙️ 4. Configuration & Setup Files

- **[`vitest.config.mts`](../vitest.config.mts)**: Configures `jsdom` environment, `@vitejs/plugin-react`, setup files, and `resolve.tsconfigPaths` for `@/*` path alias resolution.
- **[`vitest.setup.ts`](../vitest.setup.ts)**: Extends Vitest's `expect` matchers with `@testing-library/jest-dom/vitest`.

---

## 📝 5. Guidelines for Writing New Unit Tests

### Component Unit Tests (`*.test.tsx`)
1. Wrap component state updates or user events in `act` or `userEvent` when necessary.
2. Mock external dependencies like `@hello-pangea/dnd` or Next.js navigation hooks if required.
3. Test key user interactions, conditional elements (e.g., priority badges, overdue dates), and store triggers.

### Store Unit Tests (`*.test.ts`)
1. Reset the Zustand store state in `beforeEach` via `useKanbanStore.setState(...)`.
2. Mock global `fetch` calls using `vi.fn().mockResolvedValue(...)`.

### API Route Unit Tests (`*.test.ts`)
1. Mock `@/auth` and Mongoose models (`User`, `Board`, `Column`).
2. Construct mock `Request` objects and invoke exported HTTP route handlers directly (`GET(req)`, `POST(req)`).
3. Assert on response HTTP status codes (`res.status`) and JSON body payloads (`await res.json()`).
