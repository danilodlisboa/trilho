# 🛡️ LGPD Compliance & Data Protection Specification (docs/LGPD.md)

**Status:** Proposed / Under Review  
**Author:** AI Agent (Antigravity) & Trilho Team  
**Scope:** LGPD Compliance Suite (Lei Geral de Proteção de Dados - Law No. 13.709/2018)

---

## 📌 Executive Summary & Regulatory Context

This document defines the technical architecture, data handling workflows, and user-facing capabilities for achieving full compliance with the Brazilian General Data Protection Law (**LGPD - Lei Geral de Proteção de Dados, Lei nº 13.709/2018**) within the **Trilho** project management platform.

### Targeted LGPD Articles & Legal Bases
1. **Art. 7, I & Art. 8 (Consent):** Explicit opt-in consent for Terms of Service and Privacy Policy during account registration (`/register`).
2. **Art. 9 (Transparency & Third-Party Disclosure):** Transparent notice regarding data processing, controller identity (`privacy@trilho.online`), and third-party data processors (DiceBear for avatar generation, Resend API for email delivery).
3. **Art. 18, III (Correction & Rectification):** Self-service profile updates (`PUT /api/users/me`) for name and avatar preferences.
4. **Art. 18, V (Data Portability):** Immediate structured JSON export (`GET /api/users/me/export`) of all personal data, created boards, assigned cards, and invitations.
5. **Art. 18, VI (Account Deletion / Right to be Forgotten):** Permanent account erasure (`DELETE /api/users/me`) with strict cascading cleanup and board ownership transfer.
6. **Art. 41 (Data Protection Officer / DPO Channel):** Dedicated contact information (`privacy@trilho.online`) for data subject requests.
7. **Art. 46 (Security & Safeguards):** Password hashing (`bcryptjs`), signed stateless tokens (`HMAC SHA256`), rate-limiting, and strict Content Security Policy (CSP Level 3).

---

## 🏗️ Architecture & Component Specifications

```
src/
├── app/
│   ├── (public legal pages)
│   │   ├── privacy/page.tsx               # Public LGPD Privacy Policy
│   │   └── terms/page.tsx                 # Public Terms of Service
│   ├── (auth pages)
│   │   └── register/page.tsx              # Updated with mandatory Terms/Privacy consent checkbox
│   ├── profile/
│   │   └── page.tsx                       # Protected User Profile & Data Protection Dashboard
│   └── api/
│       ├── register/route.ts              # Updated to validate agreedToTerms: true
│       └── users/
│           └── me/
│               ├── route.ts               # PUT: Update profile (name, avatar)
│               └── export/
│                   └── route.ts           # GET: Export personal data JSON (Art. 18, V)
│               └── route.ts               # DELETE: Permanent account deletion (Art. 18, VI)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                     # Updated user dropdown with "Account & Privacy" link
│   │   └── Footer.tsx                     # Public legal page links (/privacy, /terms)
│   └── modals/
│       └── DeleteAccountModal.tsx         # Account deletion confirmation modal with email typing verification
```

---

## 📄 1. Public Legal Pages & Registration Consent

### A. Privacy Policy Page (`src/app/privacy/page.tsx`)
- **Publicly Accessible Route:** `/privacy` (no authentication required).
- **Content:**
  - **Data Controller Identity:** Trilho (`privacy@trilho.online`).
  - **Personal Data Collected:** Name, email address, password hash (`bcrypt`), avatar seed/URL, and board contribution metadata.
  - **Legal Bases:** Art. 7, I (Consent) and Art. 7, V (Execution of Contract).
  - **Third-Party Processors:** DiceBear (`https://api.dicebear.com` for SVG avatar rendering) and Resend API / SMTP (transactional and email verification delivery).
  - **Data Retention & Expiry:** Account data retained during active registration; 24-hour expiration for email verification tokens; 15-minute expiration for password reset tokens.
  - **Data Subject Rights:** Full outline of Art. 18 rights (access, correction, anonymization, portability, deletion, revocation of consent).

### B. Terms of Service Page (`src/app/terms/page.tsx`)
- **Publicly Accessible Route:** `/terms` (no authentication required).
- Standardized terms governing service availability, user responsibilities, and platform rules.

### C. Registration Form Consent (`src/app/register/page.tsx` & `src/app/api/register/route.ts`)
- **Frontend UI (`/register`):**
  - Checkbox element: `[x] I agree to the Terms of Service and Privacy Policy` with links opening `/terms` and `/privacy` in new browser tabs.
  - Submit button disabled until checkbox is checked.
- **Backend Validation (`POST /api/register`):**
  - Request body payload must include `agreedToTerms: boolean`.
  - If `agreedToTerms !== true`, endpoint responds with `400 Bad Request` (`{ error: 'You must accept the Terms of Service and Privacy Policy to register.' }`).

---

## ⚙️ 2. User Account & Data Management APIs

### A. Update Profile (`PUT /api/users/me`)
- **Authentication:** Required (session check).
- **Body Payload:** `{ name?: string, avatarUrl?: string }`.
- **Validation:** Name trimmed, max 100 characters, HTML special characters escaped (`&`, `<`, `>`).
- **Response:** `200 OK` with updated user object (`{ id, name, email, avatarUrl, isVerified }`).

### B. Personal Data Export (`GET /api/users/me/export`)
- **Authentication:** Required (session check).
- **LGPD Right:** Art. 18, V (Data Portability).
- **Data Aggregation:**
  1. User Profile (`id`, `name`, `email`, `avatarUrl`, `isVerified`, `createdAt`).
  2. Owned Boards & Co-member Boards (`id`, `title`, `description`, `ownerId`, `members`, `createdAt`).
  3. Cards created by or assigned to user (`id`, `title`, `description`, `priority`, `dueDate`, `customFields`).
  4. Board Invitations associated with user's email.
- **Response Format:**
  - Headers: `Content-Type: application/json`, `Content-Disposition: attachment; filename="trilho-personal-data.json"`.
  - JSON Payload Schema:
```json
{
  "exportTimestamp": "2026-08-11T22:40:00.000Z",
  "dataSubject": {
    "id": "60f7b1...",
    "name": "Maria Oliveira",
    "email": "maria@trilho.online",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    "isVerified": true,
    "createdAt": "2026-08-01T10:00:00.000Z"
  },
  "boards": [
    {
      "id": "60f7b2...",
      "title": "Marketing Sprint",
      "role": "owner",
      "createdAt": "2026-08-02T12:00:00.000Z"
    }
  ],
  "assignedCards": [
    {
      "id": "60f7b3...",
      "boardId": "60f7b2...",
      "title": "Design Landing Page",
      "priority": "high",
      "dueDate": "2026-08-15T18:00:00.000Z"
    }
  ]
}
```

### C. Account Deletion & Right to be Forgotten (`DELETE /api/users/me`)
- **Authentication:** Required (session check).
- **LGPD Right:** Art. 18, VI (Account Deletion & Data Erasure).
- **Validation:** Request body must contain `{ confirmEmail: string }` matching `session.user.email` (case-insensitive).
- **Cascading & Ownership Transfer Protocol:**
  1. **Board Ownership Resolution:**
     - Query all boards where `ownerId === userId`.
     - For each owned board:
       - If board has **no other confirmed members** (`members.length === 0`): Delete the board, its columns, cards, and custom field definitions.
       - If board has **other confirmed members**: Automatically transfer ownership (`ownerId = members[0]`), remove user from `members` array, and preserve board data for remaining members.
  2. **Member Cleanup:** Remove `userId` from `members` arrays across all boards.
  3. **Card Unassignment:** Set `assigneeId = null` for all cards assigned to `userId`.
  4. **Invitation Cleanup:** Remove all invitations referencing user's email.
  5. **User Record Deletion:** Delete user document from `User` collection.
- **Response:** `200 OK` (`{ message: 'Account and associated data deleted successfully.' }`). Triggers client-side Auth.js `signOut()`.

---

## 🎨 3. UI Implementation (`/profile` & Modals)

### A. Navbar Integration (`src/components/layout/Navbar.tsx`)
- In user profile dropdown, add **"Account & Privacy"** menu item with user icon (`UserCheck`), linking to `/profile`.

### B. User Profile Page (`src/app/profile/page.tsx`)
- Protected server/client route.
- Header: **"Account Settings & Data Privacy"** with back button to `/dashboard`.
- **Card 1: Profile Information**
  - Input field for `Name`.
  - Read-only field for `Email Address` with green badge `[ Verified ]`.
  - Avatar preview & DiceBear seed update.
  - **"Save Changes"** button.
- **Card 2: Privacy & Data Protection (LGPD - Art. 18)**
  - Explanation of LGPD Art. 18 rights.
  - **"Download My Personal Data (JSON)"** button: Triggers browser download of `trilho-personal-data.json`.
- **Card 3: Danger Zone (Account Deletion)**
  - Styled with red accents (`border-red-900/50 bg-red-950/20`).
  - Warning copy detailing permanent erasure, board deletion, or ownership transfer.
  - **"Delete Account"** button opening `<DeleteAccountModal />`.

### C. Delete Account Confirmation Modal (`src/components/modals/DeleteAccountModal.tsx`)
- Interactive dialog explaining irreversible deletion.
- Required input field: *"Type your email address to confirm deletion"*.
- **"Delete My Account Permanently"** button disabled until typed string matches user email.
- On success: Calls Auth.js `signOut({ callbackUrl: '/login' })`.

---

## 🧪 4. Verification & Testing Strategy

### A. Backend Unit & API Integration Tests (`src/app/api/__tests__/usersMe.test.ts`)
1. `PUT /api/users/me`: Verify name update and sanitize HTML input.
2. `GET /api/users/me/export`: Validate JSON schema output, headers, and content completeness.
3. `DELETE /api/users/me`:
   - Test sole-owner board deletion.
   - Test shared-board ownership transfer to remaining member.
   - Test card unassignment (`assigneeId = null`).
4. `POST /api/register`: Test rejection when `agreedToTerms` is missing.

### B. End-to-End Browser Tests (`e2e/profile-privacy.spec.ts`)
1. Registration consent checkbox verification.
2. Profile navigation from Navbar dropdown.
3. Personal data JSON export file trigger.
4. Public access to `/privacy` and `/terms`.

---

## 🔄 Memory & Change Log Protocol
Upon implementation, updates will be committed and registered in:
- `docs/memory/PROJECT_STATE.md`
- `docs/memory/USER_DIRECTIVES.md`
- `docs/memory/CHANGELOG_MEMORY.md`
