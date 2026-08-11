# 🚊 Trilho - Fullstack NoSQL Kanban Management System

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-purple)](https://zustand-demo.pmnd.rs/)

**Trilho** is a modern, high-performance fullstack Kanban project management application. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Zustand**, **MongoDB (Mongoose)**, and **Auth.js (NextAuth)**, Trilho delivers a fast experience with *Optimistic Updates* and full drag-and-drop support.

---

## ✨ Key Features

- 🔒 **Authentication & Security**: User registration, JWT login with `bcryptjs`, protected routes via Next.js Middleware, Strict Nonce Content Security Policy (CSP), and HTTP security response headers.
- ✉️ **Account Email Verification**: Email token verification workflow (24h validity) with activation email dispatch and unverified login guards.
- 🔑 **Password Recovery**: Self-service password recovery via 15-minute signed reset tokens dispatched by email.
- 📋 **Custom Boards & Invitations**: Create, edit, and delete project boards (owner authorized), with email invitations, pending invitation approval workflow, and confirmed member assignee restrictions.
- 🏷️ **Board-Scoped Custom Fields**: Create board-scoped custom fields (text, number, select, date) with auto-attachment on card creation, card modal editing, and card tag badges.
- 🗂️ **Flexible Columns & Horizontal Reordering**: 4 default columns ("To Do", "In Progress", "In Review", "Done") with custom column support and horizontal column drag-and-drop reordering (`POST /api/columns/reorder`).
- 🎯 **Interactive Cards & Drag-and-Drop**: Drag cards between columns and reorder vertically/horizontally via `@hello-pangea/dnd`.
- ⚡ **Optimistic Updates**: Reactive state via **Zustand** reflecting instant UI updates and save status indicators.
- 📝 **Detailed Card Modal**:
  - Inline title & description editing.
  - Priority selector (🔴 High, 🟡 Medium, 🟢 Low).
  - Datetime due date selector (`datetime-local`) formatted on card badges.
  - Custom field values manager.
  - **Interactive Checklist** with progress percentage (`2/5 completed`).
  - Confirmed team member assignment.
- 🔍 **Real-Time Filters & Search**: Search cards by keyword and filter by priority or assignee.
- 🎨 **Modern Interface**: Sleek aesthetics with Slate/Blue/Indigo palette and glassmorphism styling.
- 🛠️ **CLI Seeding & Cleaning**: Node/TypeScript CLI management tools (`npm run db:seed`, `npm run db:clean`).

---

## 🏗️ Architecture and Folder Structure

```
trilho/
├── AGENTS.md                    # Universal AI Agent Memory Protocol
├── docs/                        # Standardized project documentation
│   ├── memory/                  # Persistent Agent Context Memory
│   │   ├── PROJECT_STATE.md     # Project state & architecture overview
│   │   ├── CHANGELOG_MEMORY.md  # Log of commits, features, and bug fixes
│   │   └── USER_DIRECTIVES.md   # User preferences & extra-code context
│   ├── ARCHITECTURE.md          # Architecture overview & data flow
│   ├── DATABASE.md              # MongoDB Schemas & Mongoose relationships
│   ├── AUTHENTICATION.md        # Auth.js v5 setup, token verification & Middleware
│   ├── API.md                   # Detailed REST API endpoints documentation
│   ├── TESTES.md                # Fullstack Vitest & Playwright E2E testing guide
│   └── GETTING_STARTED.md       # Installation & local environment guide
├── e2e/                         # Playwright End-to-End tests
│   └── login.spec.ts            # E2E test suite for auth & navigation
├── tools/                       # CLI management scripts (seed, clean, deploy)
│   ├── seed.ts                  # Database seeder script
│   ├── clean.ts                 # Database cleaner script
│   └── deploy_gcp.ts            # GCP Cloud Run deployment script
├── src/
│   ├── app/                     # Next.js App Router (Routes & Server API Routes)
│   │   ├── api/                 # REST Endpoints (auth, boards, columns, cards, users)
│   │   ├── board/[id]/          # Main Kanban Board page
│   │   ├── dashboard/           # Workspace overview
│   │   ├── login/               # Authentication / Login page
│   │   ├── register/            # User Registration page
│   │   ├── verify-email/        # Email verification confirmation page
│   │   ├── resend-verification/ # Resend verification email request page
│   │   ├── forgot-password/     # Password reset request page
│   │   ├── reset-password/      # New password entry page
│   │   ├── globals.css          # Global styles & CSS utilities
│   │   └── layout.tsx           # Root Layout with AuthProvider
│   ├── components/
│   │   ├── kanban/              # Kanban components (Board, Column, Card)
│   │   ├── layout/              # Navbar and Sidebar navigation
│   │   ├── modals/              # Modals (Card Details, Create Board, Board Fields)
│   │   └── providers/           # Auth Session Provider
│   ├── lib/                     # Utilities (MongoDB, tokens, rate limiter, email)
│   ├── models/                  # Mongoose Schemas (User, Board, Column, Card, CustomFieldDefinition)
│   ├── store/                   # Zustand Store with Optimistic Updates
│   └── middleware.ts            # Route Guard Middleware & Strict Nonce CSP
├── playwright.config.ts         # Playwright E2E configuration
├── package.json                 # Dependencies and npm scripts
└── README.md                    # Central repository documentation
```

---

## ⚡ Quick Start

### 1. Prerequisites

- Node.js v20.x or higher (Recommended Node v22 LTS)
- **MongoDB** instance running locally (`mongodb://localhost:27017`) or MongoDB Atlas connection string.

### 2. Installation

Navigate to the `trilho` directory and install dependencies:

```bash
cd trilho
npm install
```

### 3. Environment Variables Setup

Create `.env.local` in the root of the project with:

> ⚠️ **Required:** `MONGODB_URI` and `AUTH_SECRET` are mandatory. The application will not start without them.

```env
MONGODB_URI=mongodb://localhost:27017/trilho
AUTH_SECRET=generate-a-secure-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

> **Tip:** Generate a secure `AUTH_SECRET` using `openssl rand -base64 32`.

### 4. Running in Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Tests

Run fullstack unit tests (Vitest + React Testing Library) or E2E tests (Playwright):

```bash
# Run unit test suite
npm run test

# Run Playwright End-to-End tests
npm run test:e2e
```

### 6. Database Seeding & Cleaning Tools

Populate MongoDB with default demo data or reset collections using external CLI tools:

```bash
# Seed default demo data (creates admin@trilho.online)
npm run db:seed

# Clean all collections from the database
npm run db:clean
```

**Default Credentials:**
- **Email:** `admin@trilho.online`
- **Password:** `password123`

---

## 📚 Detailed Documentation

For technical details, see the [`/docs`](./docs) folder:

- 📐 [**System Architecture (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md)
- 🗄️ [**Database Schemas (`docs/DATABASE.md`)**](./docs/DATABASE.md)
- 🔐 [**Authentication & Security (`docs/AUTHENTICATION.md`)**](./docs/AUTHENTICATION.md)
- 🌐 [**REST API Specification (`docs/API.md`)**](./docs/API.md)
- 🧪 [**Fullstack Testing Suite (`docs/TESTES.md`)**](./docs/TESTES.md)
- 🚀 [**Getting Started Guide (`docs/GETTING_STARTED.md`)**](./docs/GETTING_STARTED.md)
