import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { verifySignedToken } from '@/lib/tokens';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const payload = verifySignedToken(token, 'reset');
    if (!payload?.email) {
      return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    if (!user.isVerified) {
      user.isVerified = true;
    }
    await user.save();

    return NextResponse.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Error resetting password.' }, { status: 500 });
  }
}
