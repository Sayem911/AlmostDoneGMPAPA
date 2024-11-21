import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Store } from '@/lib/models/store.model';
import { verifyDNSRecords } from '@/lib/utils/domain';
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

    const store = await Store.findOne({ reseller: session.user.id });
    if (!store) {
      return Response.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    if (!store.domainSettings?.customDomain) {
      return Response.json(
        { error: 'No custom domain configured' },
        { status: 400 }
      );
    }

    // Verify DNS records
    const verification = await verifyDNSRecords(store.domainSettings.customDomain);

    if (verification.verified) {
      store.domainSettings.customDomainVerified = true;
      await store.save();
    }

    return Response.json({
      verified: verification.verified,
      errors: verification.errors,
      dnsSettings: store.domainSettings.dnsSettings
    });
  } catch (error) {
    console.error('Domain verification error:', error);
    return Response.json(
      { error: 'Failed to verify domain' },
      { status: 500 }
    );
  }
}