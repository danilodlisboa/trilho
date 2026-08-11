# 🚀 Local Installation and Execution Guide - Trilho

This guide provides complete instructions to set up, run, and test the **Trilho** project locally on your machine.

---

## 🛠️ 1. System Requirements

Make sure you have the following installed:

- **Node.js**: v20.x or v22.x LTS ([Download Node.js](https://nodejs.org/))
- **npm**: v10.x or higher (included with Node.js)
- **MongoDB**: Local MongoDB instance running on port `27017` or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.

---

## 📥 2. Project Setup

1. Open your terminal and navigate to the project directory:
   ```bash
   cd trilho
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## ⚙️ 3. Environment Variables Setup

Create a file named `.env.local` in the project root (`/.env.local`) with the following content:

> ⚠️ **Required:** `MONGODB_URI` and `AUTH_SECRET` are mandatory.

```env
MONGODB_URI=mongodb://localhost:27017/trilho
AUTH_SECRET=generate-a-secure-secret-key-here
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000

# Optional: Resend API / SMTP Configuration for real email dispatch
# (If omitted, emails will log to local development console)
RESEND_API_KEY=re_...
SMTP_FROM_NAME=Trilho
SMTP_FROM_EMAIL=no-reply@trilho.online
```

> **Tip:** Generate a secure `AUTH_SECRET` using `openssl rand -base64 32`.

> **MongoDB Atlas Note:** If using MongoDB Atlas in the cloud, replace `MONGODB_URI` with your connection string.

---

## 🏃 4. Running the Application

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 5. Testing & Running Test Suites

### Automated Unit Tests (Vitest + React Testing Library)
Run unit tests for components, Zustand store, Mongoose models, and Next.js 15 API routes:

```bash
# Run full unit test suite
npm run test

# Run tests in watch mode
npm run test:watch

# Generate code coverage report
npm run test:coverage
```

### End-to-End Tests (Playwright)
Run browser end-to-end user flows in chromium:

```bash
# Run Playwright E2E tests
npm run test:e2e
```

See [`docs/TESTES.md`](TESTES.md) for full testing documentation and architecture.

### Database CLI Tools (Seeding & Cleaning)
To seed demo data or clear all collections in MongoDB, run the CLI tools located in `tools/`:

```bash
# Seed initial demo datasets and admin account (admin@trilho.online / password123)
npm run db:seed

# Clear all collections from MongoDB
npm run db:clean
```

### GCP Cloud Run Deployment Tool
To deploy the application container to GCP Cloud Run:

```bash
npm run deploy:gcp
```

