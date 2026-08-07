import crypto from 'crypto';

const SECRET_KEY = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'trilho-secret-key-development';

export function createSignedToken(payload: { email: string; type: 'verify' | 'reset' }, expiresInSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const data = JSON.stringify({ ...payload, exp });
  const dataB64 = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(dataB64).digest('base64url');
  return `${dataB64}.${signature}`;
}

export function verifySignedToken(token: string, expectedType: 'verify' | 'reset'): { email: string } | null {
  try {
    const [dataB64, signature] = token.split('.');
    if (!dataB64 || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(dataB64).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf8'));
    if (payload.type !== expectedType) return null;
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;

    return { email: payload.email };
  } catch {
    return null;
  }
}
