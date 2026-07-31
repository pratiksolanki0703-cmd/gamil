/**
 * ========================================
 * 📧 GAMIL - Email Management Worker
 * ========================================
 * 
 * ⚠️ CHANGES TO MAKE (search for "CHANGE"):
 * 
 * 1. Line 25: YOUR_DOMAIN → Your domain (e.g., text2tool.in)
 * 2. Line 26: YOUR_EMAILS → Your email addresses (comma separated)
 * 3. Line 27: YOUR_FROM_EMAIL → Default sender email
 * 4. Line 28: YOUR_SENDER_NAME → Your name or business name
 * 
 * That's it! Just 4 changes and you're done.
 * ========================================
 */

// ========== CHANGE SECTION START ==========
const CONFIG = {
  domain: "YOUR_DOMAIN",           // CHANGE 1: e.g., "text2tool.in"
  emails: "YOUR_EMAILS",           // CHANGE 2: e.g., "hello@text2tool.in,support@text2tool.in"
  defaultFromEmail: "YOUR_FROM_EMAIL", // CHANGE 3: e.g., "hello@text2tool.in"
  senderName: "YOUR_SENDER_NAME",  // CHANGE 4: e.g., "Text2Tool"
};
// ========== CHANGE SECTION END ==========


export default {
  async fetch(request, env, ctx) {
    // API Key Authentication
    const apiKey = request.headers.get('X-API-Key');
    const url = new URL(request.url);
    
    // Skip auth for health check
    if (url.pathname !== '/api/health') {
      if (!apiKey || apiKey !== env.API_KEY) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response;

      if (path === '/api/receive-email' && method === 'POST') {
        response = await handleReceiveEmail(request, env);
      } else if (path === '/api/send-email' && method === 'POST') {
        response = await handleSendEmail(request, env);
      } else if (path === '/api/conversations' && method === 'GET') {
        response = await handleGetConversations(env);
      } else if (path.startsWith('/api/conversations/') && method === 'GET') {
        const id = path.split('/api/conversations/')[1];
        response = await handleGetConversation(id, env);
      } else if (path === '/api/mark-read' && method === 'POST') {
        response = await handleMarkRead(request, env);
      } else if (path === '/api/health' && method === 'GET') {
        response = new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (path === '/api/config' && method === 'GET') {
        response = new Response(JSON.stringify({
          domain: CONFIG.domain,
          emails: CONFIG.emails.split(',').map(e => e.trim()),
          defaultFromEmail: CONFIG.defaultFromEmail,
          senderName: CONFIG.senderName
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        response = new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

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


// ========== HELPER FUNCTIONS ==========

function parseEmailHeaders(rawEmail) {
  const headers = {};
  const lines = rawEmail.split('\r\n');
  for (const line of lines) {
    if (line === '') break;
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      headers[line.slice(0, colonIndex).trim().toLowerCase()] = line.slice(colonIndex + 1).trim();
    }
  }
  return headers;
}

function extractBody(rawEmail) {
  const lines = rawEmail.split('\r\n');
  let bodyStart = false;
  const bodyLines = [];
  for (const line of lines) {
    if (line === '') { bodyStart = true; continue; }
    if (bodyStart) bodyLines.push(line);
  }
  return bodyLines.join('\r\n');
}

function getParticipants(fromEmail, toEmail) {
  const participants = new Set();
  if (fromEmail) participants.add(fromEmail);
  if (toEmail) participants.add(toEmail);
  return JSON.stringify([...participants]);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// ========== API HANDLERS ==========

async function handleReceiveEmail(message, env) {
  let rawEmail, fromEmail, toEmail, subject, messageId, inReplyTo;

  // Handle Cloudflare Email Worker format
  if (message && message.raw) {
    const rawText = await new Response(message.raw).text();
    const headers = parseEmailHeaders(rawText);
    fromEmail = (headers['from'] || '').replace(/.*<|>.*/g, '').trim();
    toEmail = (headers['to'] || '').replace(/.*<|>.*/g, '').trim();
    subject = headers['subject'] || '(No Subject)';
    messageId = headers['message-id'] || `<${Date.now()}@gamil>`;
    inReplyTo = headers['in-reply-to'] || null;
    rawEmail = extractBody(rawText);
  } else if (message && message.json) {
    // API call format (for testing)
    const body = await message.json();
    fromEmail = body.from;
    toEmail = body.to;
    subject = body.subject || '(No Subject)';
    messageId = body.message_id || `<${Date.now()}@gamil>`;
    inReplyTo = body.in_reply_to || null;
    rawEmail = body.body || '';
  } else {
    return new Response(JSON.stringify({ error: 'Invalid message format' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate emails
  if (!isValidEmail(fromEmail) || !isValidEmail(toEmail)) {
    return new Response(JSON.stringify({ error: 'Invalid email format' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check if email is for our configured addresses
  const configuredEmails = CONFIG.emails.split(',').map(e => e.trim().toLowerCase());
  if (!configuredEmails.includes(toEmail.toLowerCase())) {
    return new Response(JSON.stringify({ error: 'Email not for this domain' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Find or create conversation
  let conversationId = null;
  
  if (inReplyTo) {
    const original = await env.DB.prepare(
      'SELECT conversation_id FROM messages WHERE message_id = ?'
    ).bind(inReplyTo).first();
    if (original) conversationId = original.conversation_id;
  }

  if (!conversationId) {
    const result = await env.DB.prepare(
      'INSERT INTO conversations (subject, participants, received_by_email) VALUES (?, ?, ?)'
    ).bind(subject, getParticipants(fromEmail, toEmail), toEmail.toLowerCase()).run();
    conversationId = result.meta.last_row_id;
  }

  // Insert message
  await env.DB.prepare(`
    INSERT INTO messages (conversation_id, message_id, in_reply_to, from_email, to_email, subject, body, is_outgoing)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `).bind(conversationId, messageId, inReplyTo, fromEmail, toEmail, subject, rawEmail).run();

  // Update conversation
  await env.DB.prepare(`
    UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP, unread_count = unread_count + 1 WHERE id = ?
  `).bind(conversationId).run();

  return new Response(JSON.stringify({ success: true, conversation_id: conversationId }), {
    headers: { 'Content-Type': 'application/json' }
  });
}


async function handleSendEmail(request, env) {
  const { to, subject, body, conversation_id } = await request.json();

  if (!to || !subject || !body) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate email
  if (!isValidEmail(to)) {
    return new Response(JSON.stringify({ error: 'Invalid recipient email' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Send via Resend
  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${CONFIG.senderName} <${CONFIG.defaultFromEmail}>`,
      to: [to],
      subject,
      html: body,
    }),
  });

  if (!resendResponse.ok) {
    const error = await resendResponse.text();
    console.error('Resend error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const resendData = await resendResponse.json();
  const messageId = `<${resendData.id}@gamil>`;

  // Find or create conversation
  let convId = conversation_id;
  if (!convId) {
    const result = await env.DB.prepare(
      'INSERT INTO conversations (subject, participants, received_by_email) VALUES (?, ?, ?)'
    ).bind(subject, getParticipants(CONFIG.defaultFromEmail, to), CONFIG.defaultFromEmail.toLowerCase()).run();
    convId = result.meta.last_row_id;
  }

  // Store sent message
  await env.DB.prepare(`
    INSERT INTO messages (conversation_id, message_id, from_email, to_email, subject, body, is_outgoing)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).bind(convId, messageId, CONFIG.defaultFromEmail, to, subject, body).run();

  // Update conversation
  await env.DB.prepare(`
    UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(convId).run();

  return new Response(JSON.stringify({ success: true, conversation_id: convId }), {
    headers: { 'Content-Type': 'application/json' }
  });
}


async function handleGetConversations(env) {
  const { results } = await env.DB.prepare(`
    SELECT c.*, 
      (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY received_at DESC LIMIT 1) as last_message_preview,
      (SELECT from_email FROM messages WHERE conversation_id = c.id ORDER BY received_at DESC LIMIT 1) as last_sender
    FROM conversations c ORDER BY c.last_message_at DESC
  `).all();

  return new Response(JSON.stringify({
    conversations: results.map(c => ({
      ...c,
      participants: JSON.parse(c.participants || '[]'),
      last_message_preview: c.last_message_preview?.slice(0, 100) || '',
      received_by_email: c.received_by_email || ''
    }))
  }), { headers: { 'Content-Type': 'application/json' } });
}


async function handleGetConversation(id, env) {
  const conversation = await env.DB.prepare('SELECT * FROM conversations WHERE id = ?').bind(id).first();
  
  if (!conversation) {
    return new Response(JSON.stringify({ error: 'Conversation not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { results: messages } = await env.DB.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY received_at ASC'
  ).bind(id).all();

  return new Response(JSON.stringify({
    conversation: { ...conversation, participants: JSON.parse(conversation.participants || '[]') },
    messages
  }), { headers: { 'Content-Type': 'application/json' } });
}


async function handleMarkRead(request, env) {
  const { conversation_id } = await request.json();

  if (!conversation_id) {
    return new Response(JSON.stringify({ error: 'Missing conversation_id' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  await env.DB.prepare(
    'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND is_outgoing = 0'
  ).bind(conversation_id).run();

  await env.DB.prepare(
    'UPDATE conversations SET unread_count = 0 WHERE id = ?'
  ).bind(conversation_id).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
