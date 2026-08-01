# 🔐 Authentication and Security - Trilho

This document specifies the security mechanisms, JWT session management, and access control in the **Trilho** application.

---

## 🛠️ Authentication Stack

- **Framework:** Auth.js v5 / NextAuth.js (`next-auth@beta`)
- **Session Strategy:** JWT (JSON Web Token) stateless sessions.
- **Provider:** `CredentialsProvider` (Email & Password).
- **Encryption:** `bcryptjs` for salted password hashing with cost 10.

---

## 🔄 Authentication Flow

```mermaid
sequenceDiagram
    participant User as Client / Browser
    participant Page as /login Page
    participant Auth as Auth.js Credentials Provider
    participant DB as MongoDB (User Model)
    participant MW as Next.js Middleware

    User->>Page: Submits email and password
    Page->>Auth: Calls signIn('credentials', { email, password })
    Auth->>DB: Searches User.findOne({ email })
    DB-->>Auth: Returns user document with passwordHash
    Auth->>Auth: Executes bcrypt.compare(password, passwordHash)
    
    alt Valid Password
        Auth-->>User: Issues HTTP-Only Cookie `authjs.session-token` (JWT)
        User->>MW: Accesses /dashboard or /board/:id
        MW-->>User: Allows Access
    else Invalid Password / User Not Found
        Auth-->>Page: Returns 401 Error / Invalid Credentials
    end
```

---

## 🛡️ Route Guard Middleware (`src/middleware.ts`)

Private route protection is handled at the **Edge Middleware** level in Next.js before page rendering:

- **Protected Routes:** `/board/:path*`, `/dashboard/:path*`
- **Behavior:** If `authjs.session-token` cookie is missing, middleware intercepts the request and redirects to `/login?callbackUrl=...`.
- **Auth Routes (`/login`, `/register`):** If user is already authenticated, redirects automatically to `/dashboard`.
