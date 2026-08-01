# 🌐 RESTful API Specification - Trilho

This document details all HTTP API endpoints provided by the **Trilho** application.

---

## 🟢 1. Authentication & Users

### `POST /api/register`
Registers a new user in the application.

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
    "message": "User registered successfully!",
    "user": {
      "id": "66ab...12",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=John%20Doe"
    }
  }
  ```

---

### `GET /api/users`
Returns list of registered users for task assignment and board membership. Requires authentication.

- **Response (200 OK):**
  ```json
  [
    {
      "_id": "66ab...12",
      "name": "Danilo Silva (Admin)",
      "email": "admin@trilho.com",
      "avatarUrl": "https://..."
    }
  ]
  ```

---

## 📋 2. Boards

### `GET /api/boards`
Lists all boards where the authenticated user is owner or member.

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
Returns complete board details, including populated members, columns, and cards.

---

### `PUT /api/boards/:boardId`
Updates the title or description of a board.

---

### `DELETE /api/boards/:boardId`
Deletes a board and all associated columns and cards.

---

## 🗂️ 3. Columns

### `POST /api/columns`
Creates a new column in a board.

---

### `PUT /api/columns`
Renames or reorders a column.

---

### `DELETE /api/columns?columnId=:id`
Deletes a column and all cards inside it.

---

## 🎯 4. Cards

### `POST /api/cards`
Creates a new card inside a column.

---

### `PUT /api/cards`
Updates card details (title, description, priority, due date, assignee, checklist items, column, order).

---

### `POST /api/cards/reorder`
Batch reorders cards during drag-and-drop operations.

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

---

## 🌱 5. Seed API

### `POST /api/seed`
Clears and populates the database with demo account `admin@trilho.com` (`password123`), 3 boards, columns, and cards with checklists. (Disabled in production).
