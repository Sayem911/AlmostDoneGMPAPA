import { Store } from '@/lib/models/store.model';

function sanitizeShopName(name: string): string {
  const sanitized = name
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
    .substring(0, 50);              // Limit length to 50 chars

  if (!sanitized) {
    throw new Error('Invalid shop name after sanitization');
  }

  return sanitized;
}

export async function validateUniqueShopName(shopName: string): Promise<boolean> {
  if (!shopName) {
    throw new Error('Shop name is required');
  }

  try {
    const sanitizedName = sanitizeShopName(shopName);
    
    // Check if shop name already exists (case-insensitive)
    const exists = await Store.findOne({
      name: { $regex: new RegExp(`^${sanitizedName}$`, 'i') }
    });
    
    return !exists; // Return true if name is unique (doesn't exist)
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to validate shop name');
  }
}