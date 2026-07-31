/**
 * GAMIL - API Key Authentication Middleware
 */

export function verifyApiKey(request, env) {
  const apiKey = request.headers.get('X-API-Key');
  
  // Skip auth for health check
  const url = new URL(request.url);
  if (url.pathname === '/api/health') {
    return true;
  }
  
  if (!apiKey || apiKey !== env.API_KEY) {
    return false;
  }
  
  return true;
}
