/**
 * ============================================
 * 📧 GAMIL - API Client
 * ============================================
 * Handles all API calls to Cloudflare Worker
 * ============================================
 */

const GamilAPI = {
  /**
   * Make API call to Worker
   */
  async call(endpoint, options = {}) {
    const config = this.getConfig();
    
    if (!config.workerUrl) {
      throw new Error('Worker URL not configured. Click ⚙️ Settings to configure.');
    }

    const url = `${config.workerUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `API error: ${response.status}`);
      }

      return response.json();
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Cannot connect to Worker. Check your Worker URL.');
      }
      throw err;
    }
  },

  /**
   * Get config from localStorage or APP_CONFIG
   */
  getConfig() {
    const config = {
      workerUrl: localStorage.getItem('gamil_workerUrl') || (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.workerUrl : ''),
      apiKey: localStorage.getItem('gamil_apiKey') || (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.apiKey : ''),
    };
    return config;
  },

  /**
   * Save config to localStorage
   */
  saveConfig(workerUrl, apiKey) {
    localStorage.setItem('gamil_workerUrl', workerUrl);
    localStorage.setItem('gamil_apiKey', apiKey);
  },

  /**
   * Check if configured
   */
  isConfigured() {
    const config = this.getConfig();
    return !!(config.workerUrl && config.apiKey);
  },

  // ============================================
  // API Methods
  // ============================================

  /**
   * Get app config from Worker
   */
  async getConfigFromWorker() {
    return this.call('/api/config');
  },

  /**
   * Get all conversations
   */
  async getConversations() {
    return this.call('/api/conversations');
  },

  /**
   * Get single conversation with messages
   */
  async getConversation(id) {
    return this.call(`/api/conversations/${id}`);
  },

  /**
   * Send email
   */
  async sendEmail(data) {
    return this.call('/api/send-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId) {
    return this.call('/api/mark-read', {
      method: 'POST',
      body: JSON.stringify({ 
        conversation_id: conversationId, 
        mark_all: true 
      }),
    });
  },

  /**
   * Health check
   */
  async healthCheck() {
    return this.call('/api/health');
  },
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GamilAPI;
}
