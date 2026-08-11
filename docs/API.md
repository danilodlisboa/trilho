# 🌐 RESTful API Specification - Trilho

This document details all HTTP API endpoints provided by the **Trilho** application.

---

## 🟢 1. Authentication & Users

### `POST /api/register`
Registers a new user account in the application (default `isVerified: false`).

- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "User registered successfully! Please check your email to activate your account.",
    "user": {
      "id": "66ab...12",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=John%20Doe"
    }
  }
  ```

---

### `POST /api/auth/login-check`
Pre-checks user credentials and email verification status (`isVerified`) before initiating NextAuth session.

- **Request Body:**
  ```json
  { "email": "john@example.com", "password": "securePassword123" }
  ```
- **Responses:**
  - **200 OK:** Credentials valid and account email verified.
  - **403 Forbidden:** `{ "error": "UNVERIFIED_EMAIL", "message": "Account email not verified." }`
  - **401 Unauthorized:** `{ "error": "Invalid email or password." }`

---

### `POST /api/auth/verify-email`
Verifies user account email using a 24-hour HMAC signed token.

- **Request Query/Body:** `token=...`
- **Response (200 OK):** `{ "message": "Email verified successfully!" }`

---

### `POST /api/auth/resend-verification`
Resends 24-hour email activation link to unverified account.

- **Request Body:** `{ "email": "john@example.com" }`

---

### `POST /api/auth/forgot-password`
Dispatches a 15-minute password reset link email.

- **Request Body:** `{ "email": "john@example.com" }`

---

### `POST /api/auth/reset-password`
Resets account password using a valid 15-minute signed token.

- **Request Body:** `{ "token": "...", "password": "newPassword123" }`

---

### `GET /api/users`
Returns list of users sharing active boards with the requesting user for task assignment and board invitations. Requires authentication.

---

## 📋 2. Boards & Member Invitations

### `GET /api/boards`
Lists all boards where the authenticated user is owner or confirmed member.

---

### `POST /api/boards`
Creates a new board with 4 default columns ("To Do", "In Progress", "In Review", "Done").

- **Request Body:**
  ```json
  {
    "title": "📱 Trilho Mobile App",
    "description": "Mobile application development"
  }
  ```

---

### `GET /api/boards/:boardId`
Returns complete board details, populated members, columns, and cards. Requires board membership.

---

### `PUT /api/boards/:boardId`
Updates the title or description of a board (Board owner authorization required, returns 403 for non-owners).

---

### `DELETE /api/boards/:boardId`
Deletes a board and all associated columns and cards (Board owner authorization required, returns 403 for non-owners).

---

### `POST /api/boards/:boardId/invitations`
Invites a user to a board by email address (Board owner authorization required).

- **Request Body:** `{ "email": "user@example.com" }`

---

### `GET /api/boards/invitations/pending`
Lists all pending board invitations for the authenticated user.

---

### `POST /api/boards/:boardId/invitations/accept`
Accepts a pending invitation to join a board.

---

### `POST /api/boards/:boardId/invitations/decline`
Declines a pending invitation to join a board.

---

### `DELETE /api/boards/:boardId/members/:identifier`
Removes a confirmed member or cancels a pending invitation (Board owner authorization required).

---

## 🏷️ 3. Board Custom Fields

### `GET /api/boards/:boardId/custom-fields`
Lists custom field definitions for a board.

---

### `POST /api/boards/:boardId/custom-fields`
Creates a new board-scoped custom field definition.

- **Request Body:**
  ```json
  {
    "name": "Story Points",
    "fieldType": "number",
    "isDefault": true,
    "defaultValue": "3"
  }
  ```

---

### `PUT /api/boards/:boardId/custom-fields`
Updates custom field name, options, default status, or default value.

---

### `DELETE /api/boards/:boardId/custom-fields?fieldId=:id`
Deletes a custom field definition from a board.

---

## 🗂️ 4. Columns

### `POST /api/columns`
Creates a new column in a board.

---

### `PUT /api/columns`
Renames a column.

---

### `POST /api/columns/reorder`
Batch reorders columns horizontally during drag-and-drop.

- **Request Body:**
  ```json
  {
    "columns": [
      { "id": "col1", "order": 0 },
      { "id": "col2", "order": 1 }
    ]
  }
  ```

---

### `DELETE /api/columns?columnId=:id`
Deletes a column and all cards inside it.

---

## 🎯 5. Cards

### `POST /api/cards`
Creates a new card inside a column, auto-attaching default board custom fields.

---

### `PUT /api/cards`
Updates card details (title, description, priority, due date, assignee, custom field values, checklist items, column, order). Validates assignee membership.

---

### `POST /api/cards/reorder`
Batch reorders cards during drag-and-drop operations across columns.

- **Request Body:**
  ```json
  {
    "cards": [
      { "id": "card1", "columnId": "col1", "order": 0 },
      { "id": "card2", "columnId": "col2", "order": 1 }
    ]
  }
  ```

---

### `DELETE /api/cards?cardId=:id`
Deletes a specific card.

