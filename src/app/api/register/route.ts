import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { isRateLimited, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(`register:${ip}`, 5, 60000)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      avatarUrl,
      isVerified: false,
    });

    try {
      const { createSignedToken } = await import('@/lib/tokens');
      const { sendEmail } = await import('@/lib/email');
      const token = createSignedToken({ email: normalizedEmail, type: 'verify' }, 24 * 3600);
      const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const verifyUrl = `${appUrl}/verify-email?token=${token}`;

      await sendEmail({
        to: normalizedEmail,
        subject: 'Verify your Trilho Account',
        html: `<p>Hi ${name},</p><p>Please verify your Trilho account by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
      });
    } catch (emailErr) {
      console.error('Failed to send verification email during registration:', emailErr);
    }

    return NextResponse.json(
      {
        message: 'User registered successfully! Please check your email to verify your account.',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          isVerified: false,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Error registering user.' }, { status: 500 });
  }
}
