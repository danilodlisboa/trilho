import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { createSignedToken } from '@/lib/tokens';
import { sendEmail } from '@/lib/email';
import { isRateLimited, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(`resend-verification:${ip}`, 5, 60000)) {
      return NextResponse.json(
        { error: 'Too many verification email requests. Please try again in a minute.' },
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
      return NextResponse.json({ message: 'If the email exists, a verification link has been sent.' });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Account is already verified. You can log in.' });
    }

    const token = createSignedToken({ email: normalizedEmail, type: 'verify' }, 24 * 3600);
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    await sendEmail({
      to: normalizedEmail,
      subject: 'Verify your Trilho Account',
      html: `<p>Hi ${user.name},</p><p>Please verify your Trilho account by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
    });

    return NextResponse.json({ message: 'Verification link sent! Please check your inbox.' });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Error resending verification email.' }, { status: 500 });
  }
}
