# 🗄️ NoSQL Database Model - Trilho

This document details the **MongoDB** Schemas and **Mongoose ODM** models used in **Trilho**.

---

## 🗂️ MongoDB Collections

The database consists of 4 main collections interconnected via ObjectIDs:

```mermaid
erDiagram
    User ||--o{ Board : "owns / member of"
    Board ||--|{ Column : "contains"
    Board ||--|{ Card : "belongs to"
    Column ||--|{ Card : "holds"
    User ||--o{ Card : "assigned to"
```

---

## 📐 Schemas and Document Structure

### 1. `User` Collection
Stores user credentials and profiles.

```typescript
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  createdAt: Date;
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique user identifier |
| `name` | String | Full name |
| `email` | String | Unique email (lowercase, indexed) |
| `passwordHash` | String | Salted password hash via `bcryptjs` |
| `avatarUrl` | String | Avatar image URL |
| `createdAt` | Date | Creation date |

---

### 2. `Board` Collection
Represents Kanban boards.

```typescript
export interface IBoard extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique board identifier |
| `title` | String | Board title (inline editable) |
| `description` | String | Detailed description |
| `ownerId` | Ref User | Owner user ID |
| `members` | Array[Ref User] | Associated team members |
| `createdAt` | Date | Creation date |

---

### 3. `Column` Collection
Defines columns within a board.

```typescript
export interface IColumn extends Document {
  _id: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  title: string;
  order: number;
  createdAt: Date;
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique column identifier |
| `boardId` | Ref Board | Parent board ID (indexed) |
| `title` | String | Column title (e.g. "To Do", "In Progress") |
| `order` | Number | Relative column position |
| `createdAt` | Date | Creation date |

---

### 4. `Card` Collection
Stores tasks/cards within a column and board.

```typescript
export interface IChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ICard extends Document {
  _id: mongoose.Types.ObjectId;
  columnId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  assigneeId?: mongoose.Types.ObjectId;
  checklist: IChecklistItem[];
  order: number;
  createdAt: Date;
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique card identifier |
| `boardId` | Ref Board | Associated board ID (indexed) |
| `columnId` | Ref Column | Current column ID (indexed) |
| `title` | String | Card title |
| `description` | String | Detailed description text |
| `priority` | String Enum | Priority level: `'high'`, `'medium'`, `'low'` |
| `dueDate` | Date | Task due date |
| `assigneeId` | Ref User | Assigned team member |
| `checklist` | Array[Object] | Sub-tasks checklist `{ id, text, completed }` |
| `order` | Number | Sorting order within column |
| `createdAt` | Date | Creation date |

---

## ⚡ Connection Caching (`src/lib/db.ts`)

Uses global caching to prevent connection pool exhaustion during hot reloading in Next.js App Router serverless environment.
