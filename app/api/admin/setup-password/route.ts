import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { User } from '@/lib/models/user.model';
import bcrypt from 'bcryptjs';
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

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return Response.json(
        { error: 'Current and new passwords are required' },
        { status: 400 }
      );
    }

    // Get admin user
    const admin = await User.findById(session.user.id);
    if (!admin || !admin.password) {
      return Response.json(
        { error: 'Admin user not found or no password set' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      return Response.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    admin.password = hashedPassword;
    await admin.save();

    return Response.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password setup error:', error);
    return Response.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}