import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Store } from '@/lib/models/store.model';
import dbConnect from '@/lib/db/mongodb';

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'reseller') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { theme } = await req.json();
    const store = await Store.findOne({ reseller: session.user.id });

    if (!store) {
      return Response.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Validate color formats
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (theme.primaryColor && !colorRegex.test(theme.primaryColor)) {
      return Response.json(
        { error: 'Invalid primary color format' },
        { status: 400 }
      );
    }
    if (theme.accentColor && !colorRegex.test(theme.accentColor)) {
      return Response.json(
        { error: 'Invalid accent color format' },
        { status: 400 }
      );
    }
    if (theme.backgroundColor && !colorRegex.test(theme.backgroundColor)) {
      return Response.json(
        { error: 'Invalid background color format' },
        { status: 400 }
      );
    }

    // Update theme and branding
    store.theme = {
      ...store.theme,
      primaryColor: theme.primaryColor,
      accentColor: theme.accentColor,
      backgroundColor: theme.backgroundColor
    };

    if (theme.logo) store.logo = theme.logo;
    if (theme.banner) store.banner = theme.banner;

    await store.save();

    return Response.json(store);
  } catch (error) {
    console.error('Failed to update store appearance:', error);
    return Response.json(
      { error: 'Failed to update store appearance' },
      { status: 500 }
    );
  }
}