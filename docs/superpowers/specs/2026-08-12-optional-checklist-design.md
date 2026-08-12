# Design Spec: Optional Sub-tasks Checklist on Cards

**Date:** 2026-08-12  
**Status:** Approved by User  

---

## Overview
Currently, every card opened in `CardDetailModal` displays the Sub-tasks Checklist section, progress bar, sub-task list, and "Add sub-task..." input form by default—even when no sub-tasks exist.

This design makes the Sub-tasks Checklist optional. The checklist section, progress bar, item list, and item input form will only be rendered when a checklist is attached to the card.

---

## Detailed Requirements

### 1. Card State & Attachment Behavior
- **Default State on Modal Open:**
  - If `selectedCardModal.checklist` exists and contains 1 or more items, `hasChecklist` state is `true`.
  - If `selectedCardModal.checklist` is empty (`length === 0`), `hasChecklist` state defaults to `false`.
- **Attaching a Checklist:**
  - When `hasChecklist` is `false`, a clean `+ Add Checklist` trigger button is rendered in the card modal body.
  - Clicking `+ Add Checklist` sets `hasChecklist` to `true`, revealing the Sub-tasks Checklist header, progress bar (if items exist), sub-task item list, and the "Add sub-task..." input form.
- **Detaching / Removing a Checklist:**
  - In the Sub-tasks Checklist header, a `Detach / Delete` button (trash icon or remove link) allows detaching the checklist.
  - Clicking remove sets `hasChecklist` to `false` and clears the local `checklist` array.

### 2. Local State & Unsaved Changes Integration
- `hasChecklist` and `checklist` updates are managed strictly in local component state.
- `isDirty` calculation includes checking whether `hasChecklist` or `checklist` differs from the initial card state.
- Clicking **Save & Close** commits the updated `checklist` (or empty array if detached) to the backend via `updateCard`.

---

## Affected Files
1. `src/components/modals/CardDetailModal.tsx`
2. `src/components/modals/__tests__/CardDetailModal.test.tsx`
3. `e2e/board-card.spec.ts`

---

## Verification Plan
- Unit tests: Vitest test suite (`npm run test`)
- E2E tests: Playwright test suite (`npx playwright test`)
