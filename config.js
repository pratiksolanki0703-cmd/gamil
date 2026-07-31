/**
 * GAMIL - Frontend Configuration (PUBLIC)
 * Only contains public URLs - no secrets!
 */

export default {
  // Your custom domain (e.g., hello@text2tool.in)
  domain: "text2tool.in",
  
  // Email addresses to handle (display only)
  emails: [
    "hello@text2tool.in",
    "support@text2tool.in",
    "admin@text2tool.in"
  ],
  
  // Default "From" email for display
  defaultFromEmail: "hello@text2tool.in",
  
  // Your name (displayed in sent emails)
  senderName: "Text2Tool",
  
  // Cloudflare Worker URL (public)
  workerUrl: "https://your-worker.your-subdomain.workers.dev",
  
  // Frontend URL (public)
  frontendUrl: "https://your-app.vercel.app",
};
