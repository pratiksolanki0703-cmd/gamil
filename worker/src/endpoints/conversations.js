/**
 * GAMIL - Conversations Endpoints
 * Handle listing and fetching individual conversations with messages
 */

import { formatMessageForPreview } from './helpers.js';

// Get all conversations (list view)
export async function handleGetConversations(request, env) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || '';

    let query = `
      SELECT 
        c.id,
        c.subject,
        c.participants,
        c.last_message_at,
        c.unread_count,
        c.created_at,
        (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY received_at DESC LIMIT 1) as last_message_preview,
        (SELECT from_email FROM messages WHERE conversation_id = c.id ORDER BY received_at DESC LIMIT 1) as last_sender
      FROM conversations c
    `;

    const params = [];

    if (search) {
      query += ` WHERE c.subject LIKE ? OR c.participants LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY c.last_message_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const { results } = await env.DB.prepare(query).bind(...params).all();

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM conversations';
    if (search) {
      countQuery += ' WHERE subject LIKE ? OR participants LIKE ?';
    }
    const countResult = search 
      ? await env.DB.prepare(countQuery).bind(`%${search}%`, `%${search}%`).first()
      : await env.DB.prepare(countQuery).first();

    return new Response(JSON.stringify({
      conversations: results.map(c => ({
        ...c,
        participants: JSON.parse(c.participants || '[]'),
        last_message_preview: c.last_message_preview?.slice(0, 100) || ''
      })),
      total: countResult?.total || 0,
      limit,
      offset
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch conversations' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Get single conversation with all messages
export async function handleGetConversation(conversationId, env) {
  try {
    // Get conversation details
    const conversation = await env.DB.prepare(
      'SELECT * FROM conversations WHERE id = ?'
    ).bind(conversationId).first();

    if (!conversation) {
      return new Response(JSON.stringify({ error: 'Conversation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all messages in this conversation
    const { results: messages } = await env.DB.prepare(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY received_at ASC'
    ).bind(conversationId).all();

    return new Response(JSON.stringify({
      conversation: {
        ...conversation,
        participants: JSON.parse(conversation.participants || '[]')
      },
      messages: messages.map(formatMessageForPreview)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch conversation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
