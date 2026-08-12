import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

process.env.AUTH_SECRET = 'test-secret-key-vitest-suite';
process.env.NEXTAUTH_SECRET = 'test-secret-key-vitest-suite';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
