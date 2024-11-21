import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
import { User } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'reseller') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderIds } = await req.json();
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return Response.json(
        { error: 'No orders selected' },
        { status: 400 }
      );
    }

    // Get orders and calculate total cost
    const orders = await Order.find({
      _id: { $in: orderIds },
      reseller: session.user.id,
      status: 'pending'
    });

    const totalCost = orders.reduce((sum, order) => sum + order.cost, 0);

    // Check wallet balance
    const reseller = await User.findById(session.user.id);
    if (!reseller || reseller.wallet.balance < totalCost) {
      return Response.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }

    // Process orders
    const dbSession = await Order.startSession();
    await dbSession.withTransaction(async () => {
      // Update wallet balance
      await User.findByIdAndUpdate(
        session.user.id,
        {
          $inc: { 'wallet.balance': -totalCost },
          $push: {
            'wallet.transactions': {
              type: 'debit',
              amount: totalCost,
              description: `Bulk order processing`,
              status: 'completed'
            }
          }
        },
        { session: dbSession }
      );

      // Update order statuses
      await Order.updateMany(
        { _id: { $in: orderIds } },
        { $set: { status: 'processing' } },
        { session: dbSession }
      );
    });

    return Response.json({
      success: true,
      message: `Successfully processed ${orders.length} orders`
    });
  } catch (error) {
    console.error('Failed to process orders:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to process orders' },
      { status: 500 }
    );
  }
}
