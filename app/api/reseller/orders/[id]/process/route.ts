import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
import { User } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const dbSession = await mongoose.startSession();
  
  try {
    await dbConnect();
    
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.id || authSession.user.role !== 'reseller') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbSession.startTransaction();

    // Get order and reseller
    const [order, reseller] = await Promise.all([
      Order.findById(params.id).session(dbSession),
      User.findById(authSession.user.id).session(dbSession)
    ]);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.reseller?.toString() !== authSession.user.id) {
      throw new Error('Not authorized to process this order');
    }

    if (order.status !== 'pending') {
      throw new Error('Order cannot be processed');
    }

    // Check wallet balance
    if (reseller.wallet.balance < order.cost) {
      throw new Error('Insufficient wallet balance');
    }

    // Update wallet balance
    await User.findByIdAndUpdate(
      authSession.user.id,
      {
        $inc: { 'wallet.balance': -order.cost },
        $push: {
          'wallet.transactions': {
            type: 'debit',
            amount: order.cost,
            description: `Order #${order.orderNumber}`,
            status: 'completed'
          }
        }
      },
      { session: dbSession }
    );

    // Update order status
    order.status = 'processing';
    await order.save({ session: dbSession });

    // Commit transaction
    await dbSession.commitTransaction();

    return Response.json(order);
  } catch (error) {
    await dbSession.abortTransaction();
    console.error('Failed to process order:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to process order' },
      { status: 500 }
    );
  } finally {
    dbSession.endSession();
  }
}