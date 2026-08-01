import { describe, it, expect } from 'vitest';
import { User } from '../User';

describe('User Model Schema Unit Tests', () => {
  it('should validate a user object with all required fields', () => {
    const userDoc = new User({
      name: 'Danilo Lisboa',
      email: 'DANILO@EXAMPLE.COM',
      passwordHash: 'hashed_secret_123',
    });

    const validationError = userDoc.validateSync();
    expect(validationError).toBeUndefined();
    expect(userDoc.email).toBe('danilo@example.com');
  });

  it('should fail validation when required fields are missing', () => {
    const userDoc = new User({
      name: 'John Doe',
    });

    const validationError = userDoc.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError?.errors.email).toBeDefined();
    expect(validationError?.errors.passwordHash).toBeDefined();
  });
});
