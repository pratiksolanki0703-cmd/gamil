-- GAMIL Email Management System - D1 Database Schema

-- Conversations table (email threads)
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    participants TEXT NOT NULL, -- JSON array of email addresses
    received_by_email TEXT NOT NULL DEFAULT '', -- Which inbox received this email
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (individual emails)
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    message_id TEXT UNIQUE NOT NULL, -- Original Message-ID header
    in_reply_to TEXT, -- In-Reply-To header for threading
    references TEXT, -- References header for threading
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    body_html TEXT,
    is_read INTEGER DEFAULT 0,
    is_outgoing INTEGER DEFAULT 0, -- 1 = sent by user, 0 = received
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_message_id ON messages(message_id);
CREATE INDEX IF NOT EXISTS idx_messages_in_reply_to ON messages(in_reply_to);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
