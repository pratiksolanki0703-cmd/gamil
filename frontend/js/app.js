/**
 * ============================================
 * 📧 GAMIL - Main Application Logic
 * ============================================
 * Alpine.js data and methods for the email client
 * ============================================
 */

function gamilApp() {
  return {
    // ============================================
    // STATE
    // ============================================
    
    // Conversations
    conversations: [],
    selectedConversation: null,
    messages: [],
    
    // Loading states
    loading: true,
    sending: false,
    error: null,
    
    // UI state
    searchQuery: '',
    selectedEmail: 'all',
    selectedNav: 'inbox',
    sidebarOpen: false,
    showReply: false,
    showSettings: false,
    
    // Config from Worker
    emailAddresses: [],
    
    // Reply state
    replyTo: null,
    replyToEmail: '',
    replySubject: '',
    replyBody: '',
    replyError: '',
    
    // Settings
    settingsWorkerUrl: '',
    settingsApiKey: '',
    settingsError: '',
    settingsSuccess: '',
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    async init() {
      // Load saved settings
      this.settingsWorkerUrl = localStorage.getItem('gamil_workerUrl') || '';
      this.settingsApiKey = localStorage.getItem('gamil_apiKey') || '';
      
      // Check if configured
      if (!this.settingsWorkerUrl || !this.settingsApiKey) {
        this.showSettings = true;
        this.loading = false;
        return;
      }
      
      // Fetch data
      await this.fetchConfig();
      await this.fetchConversations();
    },
    
    // ============================================
    // API METHODS
    // ============================================
    
    async fetchConfig() {
      try {
        const config = await GamilAPI.getConfigFromWorker();
        this.emailAddresses = config.emails || [];
      } catch (err) {
        console.error('Failed to fetch config:', err);
        // Non-critical, continue without email tabs
      }
    },
    
    async fetchConversations() {
      try {
        this.loading = true;
        this.error = null;
        const data = await GamilAPI.getConversations();
        this.conversations = data.conversations || [];
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    
    async selectConversation(id) {
      try {
        this.error = null;
        const data = await GamilAPI.getConversation(id);
        this.selectedConversation = data.conversation;
        this.messages = data.messages || [];
        this.sidebarOpen = false;
        
        // Mark as read
        await GamilAPI.markAsRead(id);
        
        // Update unread count in list
        this.conversations = this.conversations.map(c =>
          c.id === id ? { ...c, unread_count: 0 } : c
        );
      } catch (err) {
        console.error('Failed to fetch conversation:', err);
        this.error = err.message;
      }
    },
    
    async sendReply() {
      if (!this.replyToEmail || !this.replyBody) {
        this.replyError = 'Please fill in all fields';
        return;
      }
      
      if (!GamilUtils.isValidEmail(this.replyToEmail)) {
        this.replyError = 'Please enter a valid email address';
        return;
      }
      
      try {
        this.sending = true;
        this.replyError = '';
        
        await GamilAPI.sendEmail({
          to: this.replyToEmail,
          subject: this.replySubject,
          body: this.replyBody,
          conversation_id: this.selectedConversation?.id,
        });
        
        // Reset and refresh
        this.showReply = false;
        this.replyTo = null;
        this.replyBody = '';
        await this.fetchConversations();
      } catch (err) {
        this.replyError = err.message;
      } finally {
        this.sending = false;
      }
    },
    
    // ============================================
    // UI METHODS
    // ============================================
    
    openReply(message = null) {
      this.replyTo = message;
      this.replyToEmail = message?.from_email || '';
      this.replySubject = message 
        ? `Re: ${this.selectedConversation?.subject || ''}`
        : this.selectedConversation?.subject || '';
      this.replyBody = '';
      this.replyError = '';
      this.showReply = true;
    },
    
    closeReply() {
      this.showReply = false;
      this.replyTo = null;
      this.replyError = '';
    },
    
    selectNav(nav) {
      this.selectedNav = nav;
      // Filter logic will be handled by computed property
    },
    
    selectEmailTab(email) {
      this.selectedEmail = email;
    },
    
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    
    closeSidebar() {
      this.sidebarOpen = false;
    },
    
    // ============================================
    // SETTINGS
    // ============================================
    
    openSettings() {
      this.settingsWorkerUrl = localStorage.getItem('gamil_workerUrl') || '';
      this.settingsApiKey = localStorage.getItem('gamil_apiKey') || '';
      this.settingsError = '';
      this.settingsSuccess = '';
      this.showSettings = true;
    },
    
    closeSettings() {
      this.showSettings = false;
      this.settingsError = '';
      this.settingsSuccess = '';
    },
    
    resetSettings() {
      localStorage.removeItem('gamil_workerUrl');
      localStorage.removeItem('gamil_apiKey');
      this.settingsWorkerUrl = '';
      this.settingsApiKey = '';
      this.settingsSuccess = 'Settings cleared. Enter new values.';
    },
    
    async saveSettings() {
      this.settingsError = '';
      this.settingsSuccess = '';
      
      if (!this.settingsWorkerUrl) {
        this.settingsError = 'Worker URL is required';
        return;
      }
      
      if (!this.settingsApiKey) {
        this.settingsError = 'API Key is required';
        return;
      }
      
      // Test connection
      try {
        localStorage.setItem('gamil_workerUrl', this.settingsWorkerUrl);
        localStorage.setItem('gamil_apiKey', this.settingsApiKey);
        
        GamilAPI.saveConfig(this.settingsWorkerUrl, this.settingsApiKey);
        
        // Test the connection
        await GamilAPI.healthCheck();
        
        this.settingsSuccess = 'Settings saved successfully!';
        
        // Reload data
        setTimeout(async () => {
          this.showSettings = false;
          this.loading = true;
          await this.fetchConfig();
          await this.fetchConversations();
        }, 1000);
      } catch (err) {
        localStorage.removeItem('gamil_workerUrl');
        localStorage.removeItem('gamil_apiKey');
        this.settingsError = `Connection failed: ${err.message}`;
      }
    },
    
    // ============================================
    // COMPUTED / FILTERED
    // ============================================
    
    get filteredConversations() {
      let filtered = this.conversations;
      
      // Filter by nav (inbox, sent, all)
      if (this.selectedNav === 'inbox') {
        filtered = filtered.filter(c => c.unread_count > 0 || !c.last_is_outgoing);
      } else if (this.selectedNav === 'sent') {
        filtered = filtered.filter(c => c.last_is_outgoing);
      }
      
      // Filter by email tab
      if (this.selectedEmail !== 'all') {
        filtered = filtered.filter(c => 
          c.received_by_email?.toLowerCase() === this.selectedEmail.toLowerCase()
        );
      }
      
      // Filter by search
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(c =>
          c.subject?.toLowerCase().includes(query) ||
          c.participants?.some(p => p.toLowerCase().includes(query)) ||
          c.last_message_preview?.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    },
    
    get totalUnread() {
      return this.conversations.filter(c => c.unread_count > 0).length;
    },
    
    // ============================================
    // HELPERS
    // ============================================
    
    formatDate(dateStr) {
      return GamilUtils.formatRelativeDate(dateStr);
    },
    
    formatDateTime(dateStr) {
      return GamilUtils.formatDateTime(dateStr);
    },
    
    getInitials(email) {
      return GamilUtils.getInitials(email);
    },
    
    getAvatarColor(email) {
      return GamilUtils.getAvatarColor(email);
    },
    
    truncate(text, len = 80) {
      return GamilUtils.truncate(text, len);
    },
  };
}
