import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { Column } from '../Column';

describe('Column Model Schema Unit Tests', () => {
  it('should validate a valid Column document', () => {
    const boardId = new mongoose.Types.ObjectId();
    const colDoc = new Column({
      boardId,
      title: 'In Progress',
      order: 1,
    });

    const validationError = colDoc.validateSync();
    expect(validationError).toBeUndefined();
    expect(colDoc.title).toBe('In Progress');
    expect(colDoc.order).toBe(1);
  });

  it('should fail validation when boardId or title is missing', () => {
    const colDoc = new Column({
      order: 0,
    });

    const validationError = colDoc.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError?.errors.boardId).toBeDefined();
    expect(validationError?.errors.title).toBeDefined();
  });
});
