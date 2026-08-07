import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          error: 'UNVERIFIED_EMAIL',
          message: 'Account email not verified. Please check your inbox or click below to resend verification email.',
          email: user.email,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Login check error:', error);
    return NextResponse.json({ error: error.message || 'Error checking login credentials.' }, { status: 500 });
  }
}
