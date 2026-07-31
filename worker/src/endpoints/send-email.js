/**
 * GAMIL - Send Email Endpoint
 * Handles outgoing emails via Resend API
 */

import { getParticipants } from './helpers.js';

// Email format validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize email content (basic HTML sanitization)
function sanitizeContent(content) {
  if (!content) return '';
  // Remove script tags and event handlers
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

export async function handleSendEmail(request, env) {
  try {
    const { to, subject, body, conversation_id, from_email } = await request.json();

    // Validate required fields
    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: to, subject, body' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate email format
    if (!isValidEmail(to)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid recipient email format' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sanitize content
    const sanitizedBody = sanitizeContent(body);

    // Get sender email from config or use provided
    const senderEmail = from_email || env.DEFAULT_FROM_EMAIL || 'hello@example.com';
    const senderName = env.SENDER_NAME || 'GAMIL User';

    // Validate sender email
    if (!isValidEmail(senderEmail)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid sender email format' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: [to],
        subject: subject,
        html: sanitizedBody,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error('Resend API error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resendData = await resendResponse.json();

    // Generate message ID for threading
    const messageId = `<${resendData.id}@gamil>`;

    // Determine conversation ID
    let conversationId = conversation_id;
    
    if (!conversationId) {
      // Create new conversation if not provided
      const participants = getParticipants(senderEmail, to);
      const result = await env.DB.prepare(
        'INSERT INTO conversations (subject, participants) VALUES (?, ?)'
      ).bind(subject, participants).run();
      conversationId = result.meta.last_row_id;
    }

    // Store the sent message in database
    await env.DB.prepare(`
      INSERT INTO messages (conversation_id, message_id, from_email, to_email, 
                           subject, body, is_outgoing)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).bind(
      conversationId,
      messageId,
      senderEmail,
      to,
      subject,
      sanitizedBody
    ).run();

    // Update conversation's last message timestamp
    await env.DB.prepare(`
      UPDATE conversations 
      SET last_message_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(conversationId).run();

    return new Response(JSON.stringify({ 
      success: true, 
      message_id: resendData.id,
      conversation_id: conversationId,
      message: 'Email sent successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Send email error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
