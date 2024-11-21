import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Store } from '@/lib/models/store.model';
import { validateDomain, verifyDNSRecords } from '@/lib/utils/domain';
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

    const { customDomain } = await req.json();

    // Validate domain format
    if (customDomain && !validateDomain(customDomain)) {
      return Response.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Check if domain is already in use
    if (customDomain) {
      const existingStore = await Store.findOne({
        'domainSettings.customDomain': customDomain,
        reseller: { $ne: session.user.id }
      });

      if (existingStore) {
        return Response.json(
          { error: 'Domain is already in use' },
          { status: 400 }
        );
      }
    }

    // Get store
    const store = await Store.findOne({ reseller: session.user.id });
    if (!store) {
      return Response.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Verify DNS records if a custom domain is provided
    let dnsVerification = null;
    if (customDomain) {
      dnsVerification = await verifyDNSRecords(customDomain);
    }

    // Update store domain settings
    store.domainSettings = {
      ...store.domainSettings,
      customDomain,
      customDomainVerified: dnsVerification?.verified || false,
      dnsSettings: customDomain ? {
        aRecord: process.env.STORE_IP_ADDRESS || '123.456.789.0',
        cnameRecord: `${store.domainSettings.subdomain}.${process.env.STORE_DOMAIN || 'yourdomain.com'}`,
        verificationToken: Math.random().toString(36).substring(2)
      } : undefined
    };

    await store.save();

    return Response.json({
      store,
      dnsVerification
    });
  } catch (error) {
    console.error('Failed to update domain:', error);
    return Response.json(
      { error: 'Failed to update domain' },
      { status: 500 }
    );
  }
}