/**
 * GAMIL - Receive Email Endpoint
 * Handles incoming emails from Cloudflare Email Routing
 */

import { parseEmailHeaders, extractBody, getParticipants, isOurEmail } from './helpers.js';

export async function handleReceiveEmail(message, env) {
  try {
    let rawEmail;
    let fromEmail;
    let toEmail;
    let subject;
    let messageId;
    let inReplyTo;
    let references;

    // Cloudflare Email Worker format - message is EmailMessage object
    if (message && message.raw) {
      const rawText = await new Response(message.raw).text();
      const headers = parseEmailHeaders(rawText);
      
      fromEmail = headers['from'] || '';
      toEmail = headers['to'] || '';
      subject = headers['subject'] || '(No Subject)';
      messageId = headers['message-id'] || `<${Date.now()}@gamil>`;
      inReplyTo = headers['in-reply-to'] || null;
      references = headers['references'] || null;
      rawEmail = extractBody(rawText);
    } else if (message && message.json) {
      // API call format (for testing)
      const body = await message.json();
      fromEmail = body.from;
      toEmail = body.to;
      subject = body.subject || '(No Subject)';
      messageId = body.message_id || `<${Date.now()}@gamil>`;
      inReplyTo = body.in_reply_to || null;
      references = body.references || null;
      rawEmail = body.body || '';
    } else {
      throw new Error('Invalid email message format');
    }

    // Clean up email addresses (remove angle brackets, display names)
    fromEmail = fromEmail.replace(/.*<|>.*/g, '').trim();
    toEmail = toEmail.replace(/.*<|>.*/g, '').trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail) || !emailRegex.test(toEmail)) {
      console.error('Invalid email format:', { from: fromEmail, to: toEmail });
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if this email belongs to any of our configured addresses
    const configuredEmails = env.CONFIGURED_EMAILS ? env.CONFIGURED_EMAILS.split(',') : [];
    if (configuredEmails.length > 0 && !isOurEmail(toEmail, configuredEmails)) {
      return new Response(JSON.stringify({ error: 'Email not for this domain' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Determine conversation ID based on threading
    let conversationId = null;
    
    if (inReplyTo) {
      // This is a reply - find the original message's conversation
      const originalMessage = await env.DB.prepare(
        'SELECT conversation_id FROM messages WHERE message_id = ?'
      ).bind(inReplyTo).first();
      
      if (originalMessage) {
        conversationId = originalMessage.conversation_id;
      }
    }

    // If no conversation found, create a new one
    if (!conversationId) {
      const participants = getParticipants(fromEmail, toEmail);
      const result = await env.DB.prepare(
        'INSERT INTO conversations (subject, participants) VALUES (?, ?)'
      ).bind(subject, participants).run();
      conversationId = result.meta.last_row_id;
    }

    // Insert the message
    await env.DB.prepare(`
      INSERT INTO messages (conversation_id, message_id, in_reply_to, references, 
                           from_email, to_email, subject, body, is_outgoing)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).bind(
      conversationId,
      messageId,
      inReplyTo,
      references,
      fromEmail,
      toEmail,
      subject,
      rawEmail
    ).run();

    // Update conversation's last message timestamp and unread count
    await env.DB.prepare(`
      UPDATE conversations 
      SET last_message_at = CURRENT_TIMESTAMP, 
          unread_count = unread_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(conversationId).run();

    return new Response(JSON.stringify({ 
      success: true, 
      conversation_id: conversationId,
      message: 'Email received and stored'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Receive email error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
