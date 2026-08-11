export function getAppUrl(request?: Request): string {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    if (request?.headers) {
      const host = request.headers.get('host');
      const proto = request.headers.get('x-forwarded-proto') || 'http';
      if (host) {
        return `${proto}://${host}`;
      }
    }
    return 'http://localhost:3000';
  }

  if (!process.env.NEXTAUTH_URL) {
    throw new Error('NEXTAUTH_URL environment variable is not defined.');
  }

  return process.env.NEXTAUTH_URL;
}
