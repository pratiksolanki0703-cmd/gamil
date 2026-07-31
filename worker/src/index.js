/**
 * GAMIL - Email Management System
 * Cloudflare Worker - Main Entry Point
 */

import { verifyApiKey } from './middleware/auth.js';
import { handleReceiveEmail } from './endpoints/receive-email.js';
import { handleSendEmail } from './endpoints/send-email.js';
import { handleGetConversations, handleGetConversation } from './endpoints/conversations.js';
import { handleMarkRead } from './endpoints/mark-read.js';

export default {
  async fetch(request, env, ctx) {
    // Verify API key for all API requests
    if (!verifyApiKey(request, env)) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid API Key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response;

      // Route to appropriate handler
      if (path === '/api/receive-email' && method === 'POST') {
        response = await handleReceiveEmail(request, env);
      } else if (path === '/api/send-email' && method === 'POST') {
        response = await handleSendEmail(request, env);
      } else if (path === '/api/conversations' && method === 'GET') {
        response = await handleGetConversations(request, env);
      } else if (path.startsWith('/api/conversations/') && method === 'GET') {
        const id = path.split('/api/conversations/')[1];
        response = await handleGetConversation(id, env);
      } else if (path === '/api/mark-read' && method === 'POST') {
        response = await handleMarkRead(request, env);
      } else if (path === '/api/health' && method === 'GET') {
        response = new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        response = new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Add CORS headers to response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  },

  // Email handler for Cloudflare Email Routing
  async email(message, env, ctx) {
    try {
      await handleReceiveEmail(message, env);
    } catch (error) {
      console.error('Email processing error:', error);
    }
  }
};
