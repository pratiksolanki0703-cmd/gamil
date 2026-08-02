/**
 * ============================================
 * 📧 GAMIL - Frontend Configuration
 * ============================================
 * 
 * ⚠️ USERS: Only edit this file!
 * 
 * 1. Set your Worker URL
 * 2. Set your API Key
 * 3. Set your domain and emails (for display)
 * 
 * That's it! Save and push to GitHub.
 * ============================================
 */

const APP_CONFIG = {
  // ============================================
  // REQUIRED SETTINGS
  // ============================================
  
  // Your Cloudflare Worker URL
  // Example: "https://gamil-worker.your-subdomain.workers.dev"
  workerUrl: "https://gamil-worker.kiyih69254.workers.dev/",
  
  // Your API Key (must match Worker's API_KEY secret)
  // Generate a random string and use it in both places
  apiKey: "my_secret_key_123",
  
  // ============================================
  // DISPLAY SETTINGS (Optional - for UI labels)
  // ============================================
  
  // Your domain name
  // Example: "text2tool.in"
  domain: "tempmilo.qzz.io",
  
  // Email addresses to display in sidebar tabs
  // These are for UI display only - actual validation happens in Worker
  emails: [],
  
  // Sender name for display
  // Example: "Text2Tool"
  senderName: "tempmilo",
  
  // Default "From" email for display
  // Example: "hello@text2tool.in"
  defaultFromEmail: "hello@tempmilo.qzz.io",
  
  // ============================================
  // UI SETTINGS
  // ============================================
  
  // App name displayed in sidebar
  appName: "Email",
  
  // App subtitle displayed in sidebar
  appSubtitle: "text2tool.in",
  
  // Enable dark mode toggle (future feature)
  enableDarkMode: false,
  
  // Conversations per page
  conversationsPerPage: 20,
};

// Config.js values are the source of truth
// localStorage is only used as fallback in api.js getConfig()
// To change settings: edit this file OR use the ⚙️ Settings button in the app

// Export for use in other files
