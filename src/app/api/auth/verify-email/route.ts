import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { verifySignedToken } from '@/lib/tokens';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 });
    }

    const payload = verifySignedToken(token, 'verify');
    if (!payload?.email) {
      return NextResponse.json({ error: 'Invalid or expired verification token.' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    return NextResponse.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error: any) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: error.message || 'Error verifying email.' }, { status: 500 });
  }
}
