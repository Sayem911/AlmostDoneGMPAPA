import { User } from '@/lib/models/user.model';
import { Store } from '@/lib/models/store.model';
import { generateUniqueSubdomain } from '@/lib/utils/domain';
import bcrypt from 'bcryptjs';
import { sendNotification } from '@/lib/send-notification';

export async function handleResellerRegistration(payment: any, transactionId: string, session: any) {
  try {
    const registrationData = payment.metadata.registrationData;
    if (!registrationData) {
      throw new Error('Registration data not found');
    }

    // Generate unique subdomain from business name
    const subdomain = await generateUniqueSubdomain(registrationData.businessName);

    // Hash password
    const hashedPassword = await bcrypt.hash(registrationData.password, 12);

    // Create reseller user
    const user = new User({
      email: registrationData.email,
      password: hashedPassword,
      name: registrationData.name,
      role: 'reseller',
      status: 'pending',
      businessName: registrationData.businessName,
      wallet: {
        balance: 0,
        currency: 'BDT',
        transactions: []
      },
      statistics: {
        totalOrders: 0,
        totalRevenue: 0,
        totalProfit: 0
      },
      preferences: {
        language: 'en',
        currency: 'BDT',
        notifications: {
          email: true,
          push: true,
          orderUpdates: true,
          promotions: true
        },
        theme: 'system'
      }
    });

    await user.save({ session });

    // Create store with generated subdomain
    const store = new Store({
      reseller: user._id,
      name: registrationData.businessName,
      domainSettings: {
        subdomain,
      },
      settings: {
        defaultMarkup: 20,
        minimumMarkup: 10,
        maximumMarkup: 50,
        autoFulfillment: true,
        lowBalanceAlert: 100
      },
      theme: {
        primaryColor: '#6366f1',
        accentColor: '#4f46e5',
        backgroundColor: '#000000'
      },
      status: 'pending',
      analytics: {
        totalOrders: 0,
        totalRevenue: 0,
        totalProfit: 0
      }
    });

    await store.save({ session });

    // Update payment status
    payment.status = 'completed';
    payment.transactionId = transactionId;
    await payment.save({ session });

    // Notify admins about new reseller registration
    const adminUsers = await User.find({ role: 'admin' });
    await Promise.all(adminUsers.map(admin => 
      sendNotification({
        userId: admin._id.toString(),
        title: 'New Reseller Registration',
        message: `${registrationData.name} has registered as a reseller. Review pending.`,
        type: 'system',
        metadata: {
          resellerId: user._id,
          resellerName: registrationData.name,
          businessName: registrationData.businessName,
          role: 'admin'
        }
      })
    ));

    // Send confirmation notification to reseller
    await sendNotification({
      userId: user._id.toString(),
      title: 'Registration Successful',
      message: 'Your reseller application has been submitted. We will review it shortly.',
      type: 'system',
      metadata: {
        role: 'reseller'
      }
    });

    return user._id;
  } catch (error) {
    console.error('Error handling reseller registration:', error);
    throw error;
  }
}