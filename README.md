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

- 🔒 **Authentication & Security**: User registration, JWT login with `bcryptjs`, and protected routes via Next.js Middleware.
- 📋 **Custom Boards**: Create, edit, and delete project boards with member management.
- 🗂️ **Flexible Columns**: 4 default columns ("To Do", "In Progress", "In Review", "Done") with support for custom columns.
- 🎯 **Interactive Cards & Drag-and-Drop**: Drag cards between columns and reorder within columns with batch persistence in MongoDB via `@hello-pangea/dnd`.
- ⚡ **Optimistic Updates**: Reactive state via **Zustand** reflecting instant UI updates.
- 📝 **Detailed Card Modal**:
  - Inline title & description editing.
  - Priority selector (🔴 High, 🟡 Medium, 🟢 Low).
  - Due date indicator (highlighted red when overdue).
  - **Interactive Checklist** with progress percentage (`2/5 completed`).
  - Team member assignment.
- 🔍 **Real-Time Filters & Search**: Search cards by keyword and filter by priority or assignee.
- 🎨 **Modern Interface**: Sleek aesthetics and glassmorphism styling.
- 🌱 **Instant Seed Data**: Seed route to populate MongoDB with demo boards, columns, and tasks for immediate testing.

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
│   ├── AUTHENTICATION.md        # Auth.js v5 setup & Middleware guard
│   ├── API.md                   # Detailed REST API endpoints documentation
│   ├── TESTES.md                # Fullstack Vitest & React Testing Library guide
│   └── GETTING_STARTED.md       # Installation & local environment guide
├── tools/                       # Database management scripts (seed, clean)
│   ├── seed.ts                  # Database seeder script
│   └── clean.ts                 # Database cleaner script
├── src/
│   ├── app/                     # Next.js App Router (Routes & Server API Routes)
│   │   ├── api/                 # REST Endpoints (auth, boards, columns, cards, users)
│   │   ├── board/[id]/          # Main Kanban Board page
│   │   ├── dashboard/           # Workspace redirect & overview
│   │   ├── login/               # Authentication / Login page
│   │   ├── register/            # User Registration page
│   │   ├── globals.css          # Global styles & CSS utilities
│   │   └── layout.tsx           # Root Layout with AuthProvider
│   ├── components/
│   │   ├── kanban/              # Kanban components (Board, Column, Card)
│   │   ├── layout/              # Navbar and Sidebar navigation
│   │   ├── modals/              # Modals (Card Details, Create Board)
│   │   └── providers/           # Auth Session Provider
│   ├── lib/                     # Utilities (MongoDB connection)
│   ├── models/                  # Mongoose Schemas (User, Board, Column, Card)
│   ├── store/                   # Zustand Store with Optimistic Updates
│   └── middleware.ts            # Protected Route Guard
├── prompt.md                    # Original project specification
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

### 5. Running Unit Tests

Run the fullstack unit test suite (Vitest + React Testing Library):

```bash
npm run test
```

### 6. Database Seeding & Cleaning Tools

Populate MongoDB with default demo data or reset collections using external CLI tools:

```bash
# Seed default demo data (creates admin@trilho.com)
npm run db:seed

# Clean all collections from the database
npm run db:clean
```

**Default Credentials:**
- **Email:** `admin@trilho.com`
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
