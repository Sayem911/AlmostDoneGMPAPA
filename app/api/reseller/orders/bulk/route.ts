import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
import { User } from '@/lib/models/user.model';
import { sendNotification } from '@/lib/send-notification';
import dbConnect from '@/lib/db/mongodb';
import mongoose from 'mongoose';

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

    const { orderIds, action } = await req.json();
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return Response.json(
        { error: 'No orders selected' },
        { status: 400 }
      );
    }

    // Start transaction
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      // Get reseller
      const reseller = await User.findById(session.user.id).session(dbSession);
      if (!reseller) {
        throw new Error('Reseller not found');
      }

      // Get orders
      const orders = await Order.find({
        _id: { $in: orderIds },
        reseller: session.user.id
      }).session(dbSession);

      // Calculate total cost
      const totalCost = orders.reduce((sum, order) => sum + order.cost, 0);

      // Check wallet balance if processing orders
      if (action === 'process' && reseller.wallet.balance < totalCost) {
        throw new Error('Insufficient wallet balance');
      }

      // Update orders
      const updates = await Promise.all(orders.map(async (order) => {
        if (action === 'process' && order.status === 'pending') {
          // Deduct from wallet
          await User.findByIdAndUpdate(
            session.user.id,
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

          order.status = 'processing';
          await order.save({ session: dbSession });

          // Notify customer
          await sendNotification({
            userId: order.customer.toString(),
            title: 'Order Update',
            message: `Your order #${order.orderNumber} is now being processed`,
            type: 'order',
            metadata: {
              orderId: order._id,
              status: 'processing'
            }
          });
        }
      }));

      await dbSession.commitTransaction();

      return Response.json({
        message: `Successfully processed ${updates.length} orders`,
        success: true
      });
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    } finally {
      dbSession.endSession();
    }
  } catch (error) {
    console.error('Failed to process orders:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to process orders' },
      { status: 500 }
    );
  }
}