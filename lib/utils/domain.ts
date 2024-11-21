import { Store } from '@/lib/models/store.model';

function sanitizeSubdomain(name: string): string {
  const sanitized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
    .replace(/-+/g, '-')         // Replace multiple hyphens with single
    .replace(/^-|-$/g, '')       // Remove leading/trailing hyphens
    .substring(0, 63);           // Limit length to 63 chars

  if (!sanitized) {
    throw new Error('Invalid name for subdomain generation');
  }

  return sanitized;
}

export async function generateUniqueSubdomain(name: string): Promise<string> {
  if (!name) {
    throw new Error('Name is required for subdomain generation');
  }

  try {
    const sanitizedName = sanitizeSubdomain(name);
    
    // Try the sanitized name first
    let subdomain = sanitizedName;
    let counter = 1;
    
    while (true) {
      const exists = await Store.findOne({
        'domainSettings.subdomain': subdomain
      });
      
      if (!exists) {
        return subdomain;
      }

      // If exists, append counter and try again
      subdomain = `${sanitizedName}${counter}`;
      counter++;

      if (counter > 100) {
        throw new Error('Unable to generate unique subdomain');
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate subdomain');
  }
}

export function validateDomain(domain: string): boolean {
  if (!domain) return false;

  // Basic domain validation regex
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
  return domainRegex.test(domain);
}

export async function verifyDNSRecords(domain: string): Promise<{
  verified: boolean;
  errors?: string[];
}> {
  try {
    // Verify A record
    const aRecordResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const aRecordData = await aRecordResponse.json();

    // Verify CNAME record
    const cnameResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=CNAME`);
    const cnameData = await cnameResponse.json();

    const errors: string[] = [];

    // Check if either A record or CNAME record exists
    const hasValidARecord = aRecordData.Answer?.some((record: any) => 
      record.data === process.env.STORE_IP_ADDRESS
    );

    const hasValidCNAME = cnameData.Answer?.some((record: any) => 
      record.data.endsWith(process.env.STORE_DOMAIN || 'yourdomain.com')
    );

    if (!hasValidARecord && !hasValidCNAME) {
      errors.push('No valid DNS records found. Please configure either an A record or CNAME record.');
    }

    return {
      verified: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    return {
      verified: false,
      errors: ['Failed to verify DNS records. Please try again later.']
    };
  }
}