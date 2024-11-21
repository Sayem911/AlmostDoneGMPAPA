// Mark all API routes as dynamic
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Export common config for API routes
export const apiConfig = {
  dynamic: 'force-dynamic',
  runtime: 'nodejs',
  fetchCache: 'force-no-store',
  revalidate: 0
};