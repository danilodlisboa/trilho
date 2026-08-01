import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { Card } from '../Card';

describe('Card Model Schema Unit Tests', () => {
  it('should validate a valid Card document with default values', () => {
    const boardId = new mongoose.Types.ObjectId();
    const columnId = new mongoose.Types.ObjectId();

    const cardDoc = new Card({
      boardId,
      columnId,
      title: 'Fix Navigation Bug',
    });

    const validationError = cardDoc.validateSync();
    expect(validationError).toBeUndefined();
    expect(cardDoc.title).toBe('Fix Navigation Bug');
    expect(cardDoc.priority).toBe('medium');
    expect(cardDoc.checklist).toEqual([]);
    expect(cardDoc.order).toBe(0);
  });

  it('should fail validation when priority is invalid', () => {
    const boardId = new mongoose.Types.ObjectId();
    const columnId = new mongoose.Types.ObjectId();

    const cardDoc = new Card({
      boardId,
      columnId,
      title: 'Invalid Card',
      priority: 'urgent' as any,
    });

    const validationError = cardDoc.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError?.errors.priority).toBeDefined();
  });
});
