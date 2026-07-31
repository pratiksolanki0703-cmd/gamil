/**
 * ============================================
 * 📧 GAMIL - Utility Functions
 * ============================================
 * Helper functions for formatting, validation, etc.
 * ============================================
 */

const GamilUtils = {
  /**
   * Format date to relative time (e.g., "2h ago", "Yesterday")
   */
  formatRelativeDate(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  },

  /**
   * Format date to full datetime string
   */
  formatDateTime(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  /**
   * Format date to time only
   */
  formatTime(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  /**
   * Truncate text to specified length
   */
  truncate(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  /**
   * Extract initials from email or name
   */
  getInitials(emailOrName) {
    if (!emailOrName) return '?';
    
    // If it's an email, extract part before @
    if (emailOrName.includes('@')) {
      const name = emailOrName.split('@')[0];
      // If name has dots or underscores, take first letters
      if (name.includes('.') || name.includes('_')) {
        return name.split(/[._]/).map(s => s[0]).join('').toUpperCase().substring(0, 2);
      }
      return name.substring(0, 2).toUpperCase();
    }
    
    // If it's a name, take first letters of words
    return emailOrName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  },

  /**
   * Get color for avatar based on email/name
   */
  getAvatarColor(emailOrName) {
    if (!emailOrName) return '#6b7280';
    
    const colors = [
      'linear-gradient(135deg, #3b82f6, #8b5cf6)',  // Blue-Purple
      'linear-gradient(135deg, #10b981, #059669)',  // Green
      'linear-gradient(135deg, #f59e0b, #d97706)',  // Amber
      'linear-gradient(135deg, #ef4444, #dc2626)',  // Red
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',  // Purple
      'linear-gradient(135deg, #06b6d4, #0891b2)',  // Cyan
      'linear-gradient(135deg, #ec4899, #db2777)',  // Pink
      'linear-gradient(135deg, #14b8a6, #0d9488)',  // Teal
    ];
    
    // Generate consistent color based on string
    let hash = 0;
    for (let i = 0; i < emailOrName.length; i++) {
      hash = emailOrName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  },

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Sanitize HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Parse email body (handle basic HTML or plain text)
   */
  parseEmailBody(body) {
    if (!body) return '';
    
    // If it's already HTML, return as is
    if (body.includes('<')) {
      return body;
    }
    
    // Convert plain text to HTML (preserve line breaks)
    return this.escapeHtml(body).replace(/\n/g, '<br>');
  },

  /**
   * Debounce function
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Show browser notification
   */
  async showNotification(title, body, icon = '📧') {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon });
    }
  },

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  },

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  },

  /**
   * Download file
   */
  downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// Export for use in other files
