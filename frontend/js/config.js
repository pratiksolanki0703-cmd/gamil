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
  workerUrl: "",
  
  // Your API Key (must match Worker's API_KEY secret)
  // Generate a random string and use it in both places
  apiKey: "",
  
  // ============================================
  // DISPLAY SETTINGS (Optional - for UI labels)
  // ============================================
  
  // Your domain name
  // Example: "text2tool.in"
  domain: "",
  
  // Email addresses to display in sidebar tabs
  // These are for UI display only - actual validation happens in Worker
  emails: [],
  
  // Sender name for display
  // Example: "Text2Tool"
  senderName: "",
  
  // Default "From" email for display
  // Example: "hello@text2tool.in"
  defaultFromEmail: "",
  
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

// Save to localStorage for persistence
if (typeof localStorage !== 'undefined') {
  // Load saved settings
  const savedWorkerUrl = localStorage.getItem('gamil_workerUrl');
  const savedApiKey = localStorage.getItem('gamil_apiKey');
  
  if (savedWorkerUrl) APP_CONFIG.workerUrl = savedWorkerUrl;
  if (savedApiKey) APP_CONFIG.apiKey = savedApiKey;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_CONFIG;
}
