import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { createSignedToken } from '@/lib/tokens';
import { sendEmail } from '@/lib/email';
import { isRateLimited, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(`forgot-password:${ip}`, 5, 60000)) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ message: 'If the email exists, password reset instructions have been sent.' });
    }

    const token = createSignedToken({ email: normalizedEmail, type: 'reset' }, 15 * 60); // 15 mins
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: normalizedEmail,
      subject: 'Reset your Trilho Password',
      html: `<p>Hi ${user.name},</p><p>You requested to reset your password. Click the link below to set a new password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 15 minutes.</p>`,
    });

    return NextResponse.json({ message: 'Password reset link sent! Please check your inbox.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Error requesting password reset.' }, { status: 500 });
  }
}
