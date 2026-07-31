/**
 * GAMIL - API Client
 * Handles all API calls with authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Config API
export async function getConfig() {
  return apiCall('/api/config');
}

// Conversations API
export async function getConversations(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiCall(`/api/conversations${params}`);
}

export async function getConversation(id) {
  return apiCall(`/api/conversations/${id}`);
}

// Messages API
export async function sendEmail(data) {
  return apiCall('/api/send-email', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function markAsRead(conversationId) {
  return apiCall('/api/mark-read', {
    method: 'POST',
    body: JSON.stringify({ conversation_id: conversationId, mark_all: true }),
  });
}

// Health check
export async function healthCheck() {
  return apiCall('/api/health');
}
