import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
import { User } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
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

    // Get customer details
    const customer = await User.findById(params.id)
      .select('name email image');

    if (!customer) {
      return Response.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get customer's order history
    const orders = await Order.find({
      customer: params.id,
      reseller: session.user.id
    })
    .sort({ createdAt: -1 })
    .populate('items.product', 'title imageUrl');

    // Calculate customer metrics
    const metrics = await Order.aggregate([
      {
        $match: {
          customer: new ObjectId(params.id),
          reseller: new ObjectId(session.user.id)
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Get customer's favorite products
    const favoriteProducts = await Order.aggregate([
      {
        $match: {
          customer: new ObjectId(params.id),
          reseller: new ObjectId(session.user.id)
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalSpent: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          title: '$product.title',
          imageUrl: '$product.imageUrl',
          totalQuantity: 1,
          totalSpent: 1
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 5
      }
    ]);

    return Response.json({
      customer,
      orders,
      metrics: metrics[0] || {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0
      },
      favoriteProducts
    });
  } catch (error) {
    console.error('Failed to fetch customer details:', error);
    return Response.json(
      { error: 'Failed to fetch customer details' },
      { status: 500 }
    );
  }
}