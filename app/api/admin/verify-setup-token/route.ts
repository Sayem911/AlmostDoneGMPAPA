import { NextRequest } from 'next/server';
import { User } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { token } = await req.json();
    if (!token) {
      return Response.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Check if token matches environment variable
    if (token !== process.env.ADMIN_SETUP_KEY) {
      return Response.json(
        { error: 'Invalid setup token' },
        { status: 401 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return Response.json(
        { error: 'Admin account already exists' },
        { status: 400 }
      );
    }

    return Response.json({
      valid: true,
      message: 'Token verified successfully'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return Response.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}