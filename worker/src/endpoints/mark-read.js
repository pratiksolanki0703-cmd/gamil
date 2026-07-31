/**
 * GAMIL - Mark Read Endpoint
 * Handle marking messages as read/unread
 */

export async function handleMarkRead(request, env) {
  try {
    const { message_id, conversation_id, mark_all } = await request.json();

    if (mark_all && conversation_id) {
      // Mark all messages in a conversation as read
      await env.DB.prepare(
        'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND is_outgoing = 0'
      ).bind(conversation_id).run();

      // Reset unread count for conversation
      await env.DB.prepare(
        'UPDATE conversations SET unread_count = 0 WHERE id = ?'
      ).bind(conversation_id).run();

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'All messages marked as read' 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } else if (message_id) {
      // Mark single message as read
      const message = await env.DB.prepare(
        'SELECT conversation_id FROM messages WHERE id = ?'
      ).bind(message_id).first();

      if (message) {
        await env.DB.prepare(
          'UPDATE messages SET is_read = 1 WHERE id = ?'
        ).bind(message_id).run();

        // Decrement unread count for conversation
        await env.DB.prepare(`
          UPDATE conversations 
          SET unread_count = MAX(0, unread_count - 1) 
          WHERE id = ? AND unread_count > 0
        `).bind(message.conversation_id).run();
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Message marked as read' 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } else {
      return new Response(JSON.stringify({ 
        error: 'Provide either message_id or conversation_id with mark_all' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Mark read error:', error);
    return new Response(JSON.stringify({ error: 'Failed to mark as read' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
