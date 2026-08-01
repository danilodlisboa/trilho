import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { Board } from '../Board';

describe('Board Model Schema Unit Tests', () => {
  it('should validate a valid Board document', () => {
    const ownerId = new mongoose.Types.ObjectId();
    const boardDoc = new Board({
      title: 'Project Alpha',
      description: 'Main product development',
      ownerId,
      members: [ownerId],
    });

    const validationError = boardDoc.validateSync();
    expect(validationError).toBeUndefined();
    expect(boardDoc.title).toBe('Project Alpha');
    expect(boardDoc.ownerId).toEqual(ownerId);
  });

  it('should fail validation when title or ownerId is missing', () => {
    const boardDoc = new Board({
      description: 'Missing title and owner',
    });

    const validationError = boardDoc.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError?.errors.title).toBeDefined();
    expect(validationError?.errors.ownerId).toBeDefined();
  });
});
