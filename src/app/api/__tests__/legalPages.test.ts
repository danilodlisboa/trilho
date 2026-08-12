import { describe, it, expect } from 'vitest';
import PrivacyPage from '@/app/privacy/page';
import TermsPage from '@/app/terms/page';

describe('Public Legal Pages', () => {
  it('exports PrivacyPage component', () => {
    expect(typeof PrivacyPage).toBe('function');
  });

  it('exports TermsPage component', () => {
    expect(typeof TermsPage).toBe('function');
  });
});
