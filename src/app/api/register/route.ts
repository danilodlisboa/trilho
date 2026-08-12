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

    const { name, email, password, agreedToTerms } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (!agreedToTerms) {
      return NextResponse.json(
        { error: 'You must accept the Terms of Service and Privacy Policy to register.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim().slice(0, 100);
    const trimmedEmail = email.trim().toLowerCase().slice(0, 255);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be between 6 and 128 characters.' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: trimmedEmail });

    if (existingUser) {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedName)}`;
    const safeHtmlName = trimmedName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
      avatarUrl,
      isVerified: false,
    });

    try {
      const { createSignedToken } = await import('@/lib/tokens');
      const { sendEmail } = await import('@/lib/email');
      const { getAppUrl } = await import('@/lib/getAppUrl');
      const token = createSignedToken({ email: trimmedEmail, type: 'verify' }, 24 * 3600);
      const appUrl = getAppUrl(req);
      const verifyUrl = `${appUrl}/verify-email?token=${token}`;

      await sendEmail({
        to: trimmedEmail,
        subject: 'Verify your Trilho Account',
        html: `<p>Hi ${safeHtmlName},</p><p>Please verify your Trilho account by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
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
