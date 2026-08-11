import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        await connectToDatabase();
        const user = await User.findOne({ email: (credentials.email as string).toLowerCase() });

        if (!user || !user.passwordHash) {
          throw new Error('User not found');
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) {
          throw new Error('Incorrect password');
        }

        if (!user.isVerified) {
          throw new Error('Account email not verified. Please check your inbox or resend verification email.');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatarUrl || '',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const isProd = process.env.NODE_ENV === 'production';

      if (!isProd) {
        try {
          const parsedUrl = new URL(url, baseUrl);
          if (parsedUrl.host.includes('trilho.online')) {
            const localHost = 'http://localhost:3000';
            return `${localHost}${parsedUrl.pathname}${parsedUrl.search}`;
          }
          if (parsedUrl.host.includes('localhost') || parsedUrl.host.includes('127.0.0.1')) {
            return parsedUrl.toString();
          }
          return `http://localhost:3000${parsedUrl.pathname}${parsedUrl.search}`;
        } catch {
          return 'http://localhost:3000/dashboard';
        }
      }

      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === new URL(baseUrl).origin) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
});
