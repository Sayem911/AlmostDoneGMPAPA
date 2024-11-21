import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
import { Payment } from '@/lib/models/payment.model';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.id || authSession.user.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, reason } = await req.json();

    // Get order and payment
    const [order, payment] = await Promise.all([
      Order.findById(orderId),
      Payment.findOne({ orderId })
    ]);

    if (!order || !payment) {
      return Response.json(
        { error: 'Order or payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'completed') {
      return Response.json(
        { error: 'Payment cannot be refunded' },
        { status: 400 }
      );
    }

    // Start transaction
    const dbSession = await Order.startSession();
    dbSession.startTransaction();

    try {
      // Update payment status
      payment.status = 'refunded';
      payment.metadata = {
        ...payment.metadata,
        refundReason: reason,
        refundedAt: new Date(),
        refundedBy: authSession.user.id
      };
      await payment.save({ session: dbSession });

      // Update order status
      order.status = 'refunded';
      order.paymentStatus = 'refunded';
      await order.save({ session: dbSession });

      await dbSession.commitTransaction();

      return Response.json({
        success: true,
        message: 'Refund processed successfully'
      });
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    } finally {
      dbSession.endSession();
    }
  } catch (error) {
    console.error('Refund error:', error);
    return Response.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
