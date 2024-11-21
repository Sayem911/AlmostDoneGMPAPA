import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
import { User } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { apiConfig } from '../../route-config';
export const { dynamic, fetchCache, revalidate } = apiConfig;

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'reseller') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get unique customers from orders
    const customersAggregation = await Order.aggregate([
      {
        $match: {
          reseller: new ObjectId(session.user.id)
        }
      },
      {
        $group: {
          _id: '$customer',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' },
          firstOrderDate: { $min: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      {
        $unwind: '$customerInfo'
      },
      {
        $match: search ? {
          $or: [
            { 'customerInfo.name': { $regex: search, $options: 'i' } },
            { 'customerInfo.email': { $regex: search, $options: 'i' } }
          ]
        } : {}
      },
      {
        $sort: { lastOrderDate: -1 }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 1,
          name: '$customerInfo.name',
          email: '$customerInfo.email',
          image: '$customerInfo.image',
          totalOrders: 1,
          totalSpent: 1,
          lastOrderDate: 1,
          firstOrderDate: 1,
          customerSince: '$firstOrderDate'
        }
      }
    ]);

    // Get total count for pagination
    const totalCustomers = await Order.aggregate([
      {
        $match: {
          reseller: new ObjectId(session.user.id)
        }
      },
      {
        $group: {
          _id: '$customer'
        }
      },
      {
        $count: 'total'
      }
    ]);

    return Response.json({
      customers: customersAggregation,
      pagination: {
        total: totalCustomers[0]?.total || 0,
        pages: Math.ceil((totalCustomers[0]?.total || 0) / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return Response.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}