import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { User } from '@/lib/models/user.model';
import crypto from 'crypto';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Store token with expiration (24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create setup URL
    const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin-setup/${token}`;

    return Response.json({
      token,
      setupUrl,
      expiresAt
    });
  } catch (error) {
    console.error('Failed to generate setup token:', error);
    return Response.json(
      { error: 'Failed to generate setup token' },
      { status: 500 }
    );
  }
}