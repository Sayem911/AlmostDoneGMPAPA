import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ResellerProduct } from '@/lib/models/reseller-product.model';
import { Store } from '@/lib/models/store.model';
import dbConnect from '@/lib/db/mongodb';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'reseller') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { layout } = await req.json();

    // Validate required fields
    const requiredFields = ['title', 'variants'];
    if (!layout.fieldOrder.includes('title') || !layout.fieldOrder.includes('variants')) {
      return Response.json({
        error: 'Title and variants sections cannot be removed from layout'
      }, { status: 400 });
    }

    // Get store to verify reseller
    const store = await Store.findOne({ reseller: session.user.id });
    if (!store) {
      return Response.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Update or create reseller product
    const resellerProduct = await ResellerProduct.findOneAndUpdate(
      {
        resellerId: session.user.id,
        productId: params.id
      },
      {
        $set: { layout }
      },
      {
        new: true,
        upsert: true
      }
    );

    return Response.json(resellerProduct);
  } catch (error) {
    console.error('Failed to update product layout:', error);
    return Response.json(
      { error: 'Failed to update product layout' },
      { status: 500 }
    );
  }
}