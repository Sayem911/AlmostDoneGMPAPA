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

    const { settings } = await req.json();
    const store = await Store.findOne({ reseller: session.user.id });

    if (!store) {
      return Response.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Validate markup settings
    if (settings.defaultMarkup !== undefined) {
      if (settings.defaultMarkup < store.settings.minimumMarkup || 
          settings.defaultMarkup > store.settings.maximumMarkup) {
        return Response.json({
          error: `Default markup must be between ${store.settings.minimumMarkup}% and ${store.settings.maximumMarkup}%`
        }, { status: 400 });
      }
    }

    // Update settings
    store.settings = {
      ...store.settings,
      ...settings
    };

    await store.save();

    return Response.json(store);
  } catch (error) {
    console.error('Failed to update store settings:', error);
    return Response.json(
      { error: 'Failed to update store settings' },
      { status: 500 }
    );
  }
}