# CUSTOM EMAIL MANAGEMENT WEBSITE - COMPLETE BUILD PROMPT

## PROJECT OVERVIEW

Build a Gmail-like email management website that allows users to manage custom domain emails (e.g., hello@text2tool.in). The system forwards incoming emails and stores them with a beautiful conversation-threaded interface. Users can reply to emails directly from the website without needing to use Gmail. The website also receives email notifications via Gmail forwarding (for notification purposes only).

---

## COMPLETE ARCHITECTURE

### SYSTEM FLOW

```
INCOMING EMAIL:
External Email → hello@text2tool.in
    ↓
Cloudflare Email Routing (webhook)
    ↓
Cloudflare Worker (/api/receive-email)
    ├─ Parse email (from, subject, body, headers)
    ├─ Check if reply to existing conversation (In-Reply-To header)
    ├─ Create new conversation OR add to existing conversation
    ├─ Store in Database (Supabase/Firebase)
    ├─ Forward to Gmail (via Resend API) - notification only
    └─ Return success response
    ↓
Gmail receives copy (for browser notification)
    ↓
User sees Gmail notification
    ↓
User opens website
    ↓
Website displays conversation thread with all replies


OUTGOING EMAIL:
User types reply in website
    ↓
Clicks Send button
    ↓
Frontend calls Worker (/api/send-email)
    ↓
Worker calls Resend API with proper headers:
    ├─ from: hello@text2tool.in
    ├─ to: original_sender
    ├─ In-Reply-To: original_message_id
    └─ References: all_previous_message_ids
    ↓
Email sent ✅
    ↓
Message added to conversation in database
    ↓
Website updates to show sent message
```

---

## DATABASE SCHEMA

### Collections/Tables Structure

```
DATABASE: CONVERSATIONS

Document: conversations/{conversationId}
{
  conversationId: "conv_unique_id",
  participants: ["john@example.com", "hello@text2tool.in"],
  subject: "Meeting Tomorrow",
  lastMessage: "Perfect! See you there!",
  lastMessageTime: "2024-01-15T16:00:00Z",
  lastMessageType: "outgoing",
  unread: false,
  createdAt: "2024-01-15T14:30:00Z",
  updatedAt: "2024-01-15T16:00:00Z",
  archivedAt: null,
  messages: [
    {
      messageId: "msg_1",
      from: "john@example.com",
      to: "hello@text2tool.in",
      subject: "Meeting Tomorrow",
      body: "<p>Hi, can we meet tomorrow at 10am?</p>",
      type: "incoming",
      timestamp: "2024-01-15T14:30:00Z",
      originalMessageId: "unique_email_id_1",
      inReplyTo: null,
      references: []
    },
    {
      messageId: "msg_2",
      from: "hello@text2tool.in",
      to: "john@example.com",
      subject: "Re: Meeting Tomorrow",
      body: "<p>Yes! 10am works for me. See you!</p>",
      type: "outgoing",
      timestamp: "2024-01-15T15:15:00Z",
      originalMessageId: "unique_email_id_2",
      inReplyTo: "unique_email_id_1",
      references: ["unique_email_id_1"]
    },
    {
      messageId: "msg_3",
      from: "john@example.com",
      to: "hello@text2tool.in",
      subject: "Re: Meeting Tomorrow",
      body: "<p>Great! Conference room A?</p>",
      type: "incoming",
      timestamp: "2024-01-15T15:45:00Z",
      originalMessageId: "unique_email_id_3",
      inReplyTo: "unique_email_id_2",
      references: ["unique_email_id_1", "unique_email_id_2"]
    },
    {
      messageId: "msg_4",
      from: "hello@text2tool.in",
      to: "john@example.com",
      subject: "Re: Meeting Tomorrow",
      body: "<p>Perfect! See you there!</p>",
      type: "outgoing",
      timestamp: "2024-01-15T16:00:00Z",
      originalMessageId: "unique_email_id_4",
      inReplyTo: "unique_email_id_3",
      references: ["unique_email_id_1", "unique_email_id_2", "unique_email_id_3"]
    }
  ]
}
```

---

## WORKER ENDPOINTS

### 1. Receive Email Endpoint: `/api/receive-email` (POST)

**Purpose:** Receive incoming emails from Cloudflare Email Routing webhook

**Input (from Cloudflare routing):**
```json
{
  "from": "john@example.com",
  "to": "hello@text2tool.in",
  "subject": "Meeting Tomorrow",
  "text": "Hi, can we meet tomorrow at 10am?",
  "html": "<p>Hi, can we meet tomorrow at 10am?</p>",
  "headers": {
    "in-reply-to": "<previous_message_id>",
    "references": "<all_previous_message_ids>",
    "message-id": "<unique_message_id>"
  }
}
```

**Logic:**
1. Extract email data (from, subject, body, message-id)
2. Extract threading headers (In-Reply-To, References)
3. Check if In-Reply-To header exists
   - If YES: Find existing conversation by message-id → Add to conversation
   - If NO: Create new conversation with this email as first message
4. Sanitize email body (remove script tags, malicious content)
5. Store in database with timestamp and message type "incoming"
6. Forward to Gmail account (via Resend API) with same subject
7. Return success response

**Output:**
```json
{
  "success": true,
  "conversationId": "conv_123",
  "messageId": "msg_1",
  "forwardedToGmail": true
}
```

---

### 2. Send Email Endpoint: `/api/send-email` (POST)

**Purpose:** Send reply email via Resend API

**Input (from frontend):**
```json
{
  "conversationId": "conv_123",
  "to": "john@example.com",
  "subject": "Re: Meeting Tomorrow",
  "body": "<p>Yes! 10am works for me. See you!</p>",
  "inReplyTo": "unique_email_id_1",
  "references": ["unique_email_id_1"]
}
```

**Logic:**
1. Validate input (to, body required)
2. Call Resend API with:
   ```
   from: "hello@text2tool.in"
   to: recipient_email
   subject: subject
   html: body
   reply_to: recipient_email
   headers: {
     In-Reply-To: inReplyTo_id,
     References: references_ids
   }
   ```
3. If Resend returns success:
   - Save message to conversation in database
   - Mark as "outgoing" type
   - Set timestamp
4. Return success response

**Output:**
```json
{
  "success": true,
  "messageId": "msg_2",
  "resendId": "resend_unique_id"
}
```

---

### 3. Get Conversations Endpoint: `/api/conversations` (GET)

**Purpose:** Fetch all conversations for display in sidebar

**Query Parameters:**
- sort: "newest" | "oldest" | "unread" (default: newest)
- limit: number (default: 50)

**Output:**
```json
{
  "conversations": [
    {
      "conversationId": "conv_123",
      "participants": ["john@example.com"],
      "subject": "Meeting Tomorrow",
      "lastMessage": "Perfect! See you there!",
      "lastMessageTime": "2024-01-15T16:00:00Z",
      "unread": false,
      "lastMessageType": "outgoing"
    }
  ]
}
```

---

### 4. Get Single Conversation Endpoint: `/api/conversations/{conversationId}` (GET)

**Purpose:** Fetch full conversation with all messages

**Output:** Complete conversation object with all messages array (see schema above)

---

### 5. Mark as Read Endpoint: `/api/mark-read` (POST)

**Purpose:** Mark conversation as read

**Input:**
```json
{
  "conversationId": "conv_123"
}
```

**Output:**
```json
{
  "success": true
}
```

---

## FRONTEND REQUIREMENTS

### Tech Stack
- **Framework:** React 18+ with Vite
- **Styling:** Tailwind CSS OR CSS Modules (clean, professional design)
- **State Management:** React Hooks (useState, useContext, useReducer)
- **Data Fetching:** Fetch API OR Axios
- **Build:** Vite
- **Hosting:** Vercel OR Netlify (free tier)

### UI Layout

#### Overall Layout
```
┌─────────────────────────────────────────────────────┐
│  HEADER                                             │
├────────────────────┬────────────────────────────────┤
│  SIDEBAR           │   MAIN AREA                    │
│  (Conversations)   │   (Conversation View)          │
│                    │                                │
│  - Search          │   - Subject                    │
│  - Sort Options    │   - With: email                │
│  - Conv List       │   - Messages Thread            │
│                    │   - Reply Box                  │
└────────────────────┴────────────────────────────────┘
```

---

### 1. Sidebar Component

**Features:**
- **Search Bar** - Filter conversations by participant or subject
- **Sort Options** - Dropdown: "Newest", "Oldest", "Unread Only"
- **Conversations List** - Scrollable list of all conversations

**Each Conversation Item Shows:**
```
┌─────────────────────────┐
│ [●] John Smith          │  ← Unread indicator (● for unread, ○ for read)
│ Meeting Tomorrow        │  ← Subject line
│ "Perfect! See you..."   │  ← Last message preview (truncated)
│ 4:00 PM                 │  ← Time of last message
│ Incoming / Outgoing     │  ← Type badge
└─────────────────────────┘
```

**Behavior:**
- Click to open conversation
- Highlight selected conversation
- Show unread count badge at top

---

### 2. Main Conversation View

**Header Section:**
```
Subject: "Meeting Tomorrow"
With: john@example.com
Date Started: Jan 15, 2024 at 2:30 PM
```

**Message Thread Section (Scrollable):**

Each message shows:
```
┌─────────────────────────────────────────┐
│ 2:30 PM                                 │
│ John Smith <john@example.com>           │
├─────────────────────────────────────────┤
│ Hi, can we meet tomorrow at 10am?       │
└─────────────────────────────────────────┘

(gap between messages)

┌─────────────────────────────────────────┐
│ 3:15 PM - YOU REPLIED                   │  ← Different styling for outgoing
├─────────────────────────────────────────┤
│ Yes! 10am works for me. See you!        │
└─────────────────────────────────────────┘
```

**Styling for Message Types:**
- **Incoming:** Gray background, left-aligned
- **Outgoing:** Blue background, right-aligned, "You" label

---

### 3. Reply Box Component

**Location:** At bottom of conversation

**Elements:**
```
┌─────────────────────────────────────────┐
│ Reply to john@example.com               │
├─────────────────────────────────────────┤
│ [Rich Text Editor or Simple Textarea]   │
│                                         │
│ [Send] [Cancel/Discard]                 │
└─────────────────────────────────────────┘
```

**Features:**
- Text input (can be simple textarea or rich editor)
- Send button (disabled if empty)
- Cancel button
- Character count (optional)
- Loading state while sending

---

### 4. Empty State

When no conversation selected:
```
┌─────────────────────────────────────────┐
│                                         │
│      Select a conversation              │
│      to read messages                   │
│                                         │
│      [Icon: envelope]                   │
│                                         │
└─────────────────────────────────────────┘
```

---

### 5. No Conversations State

When no conversations exist:
```
┌─────────────────────────────────────────┐
│      No emails yet                      │
│                                         │
│      Send an email to:                  │
│      hello@text2tool.in                 │
│                                         │
│      And it will appear here!           │
│                                         │
└─────────────────────────────────────────┘
```

---

## FEATURES TO IMPLEMENT

### Core Features (Must Have)

✅ **Email Threading**
- Display all messages in conversation chronologically
- Show sender info for each message
- Differentiate between incoming and outgoing messages
- Proper subject with "Re:" prefix for replies

✅ **Inbox Management**
- List all conversations in sidebar
- Show last message preview
- Show timestamp of last message
- Mark conversations as read/unread
- Show unread badge count

✅ **Email Receiving**
- Receive emails at custom domain
- Auto-forward to Gmail (notification)
- Store in database
- Show in inbox within seconds

✅ **Email Sending**
- Reply to emails from website
- Send via Resend API
- Proper email headers (In-Reply-To, References)
- Show sent status

✅ **Notifications**
- Gmail browser notifications (via forwarding)
- Unread badge in sidebar
- Real-time updates (polling every 5-10 seconds)

✅ **Search** (Simple)
- Search conversations by participant name or email
- Search by subject line

### Nice-to-Have Features (Future)

⭐ **Archive Conversations**
- Hide old conversations
- Un-archive option

⭐ **Delete Conversations**
- Soft delete (mark as deleted)

⭐ **Rich Text Editor**
- Bold, italic, formatting
- Link insertion

⭐ **Attachments** (if needed)
- Display attachment links
- Basic file preview

⭐ **Dark Mode**
- Toggle dark/light theme

⭐ **Mobile Responsive**
- Works on iPhone/Android
- Stack layout on mobile

---

## ENVIRONMENT VARIABLES & SECRETS

### Cloudflare Worker Secrets (via `wrangler secret put`)

```
RESEND_API_KEY=re_xxxxxxxxxxxxx          (Resend API key)
DATABASE_URL=xxxxx                        (Supabase/Firebase connection)
GMAIL_FORWARD_ADDRESS=yourmail@gmail.com  (Where to forward emails)
```

### Frontend Environment Variables (`.env`)

```
VITE_WORKER_URL=https://your-worker.workers.dev
VITE_DOMAIN=text2tool.in
```

---

## SETUP INSTRUCTIONS FOR USER

### Step 1: Resend Setup
```
1. Go to resend.com
2. Sign up (free)
3. Add domain: text2tool.in
4. Add DNS records in Cloudflare
5. Verify domain
6. Copy API key
7. Set in worker: wrangler secret put RESEND_API_KEY
```

### Step 2: Cloudflare Worker Setup
```
1. npm install -g wrangler
2. Create worker project
3. Add provided worker code
4. Add secrets
5. Deploy: wrangler deploy
6. Note the worker URL (e.g., https://email-app.workers.dev)
```

### Step 3: Database Setup (Choose One)

**Option A: Supabase (Recommended)**
```
1. Go to supabase.com
2. Create new project
3. Create conversations table with schema
4. Copy connection string
5. Set: wrangler secret put DATABASE_URL
```

**Option B: Firebase**
```
1. Go to firebase.google.com
2. Create new project
3. Create Firestore database
4. Copy credentials
5. Set secrets
```

### Step 4: Cloudflare Email Routing
```
1. Cloudflare Dashboard
2. Email Routing
3. Add Catch-all Rule:
   Match: *@text2tool.in
   Forward to: https://your-worker.workers.dev/api/receive-email
4. Test: Send email to hello@text2tool.in
```

### Step 5: Frontend Deployment
```
1. Build: npm run build
2. Deploy to Vercel/Netlify
3. Set environment variables
4. Done!
```

---

## EXPECTED USER FLOW

1. **Email arrives** at hello@text2tool.in
2. **Gmail notification** pops up (forwarded copy)
3. **User opens website**
4. **Sees new email** in inbox with unread badge
5. **Clicks to read** full conversation
6. **Types reply** in reply box
7. **Clicks Send**
8. **Email sent** via Resend
9. **Message appears** in conversation as "outgoing"
10. **Original sender replies** → Cycle continues

---

## IMPORTANT TECHNICAL NOTES

### Email Threading Headers

When sending replies, MUST include:
- `In-Reply-To: <original-message-id>` ← Links to the original email
- `References: <all-previous-message-ids>` ← Shows full thread history

Without these, Gmail/other clients won't thread properly!

### Message ID Extraction

When receiving emails, extract and store:
- `Message-ID` header (unique identifier)
- `In-Reply-To` header (if it's a reply)
- `References` header (all IDs in thread)

### Sanitization

Always sanitize incoming HTML email body to prevent:
- Script injections
- Malicious forms
- Tracking pixels (optional)

### Time Zones

- Store all timestamps in UTC (ISO 8601)
- Display in user's local time (JavaScript handles this)

---

## FILE STRUCTURE

```
email-system/
├── worker/
│   ├── src/
│   │   └── index.js (all endpoints)
│   ├── wrangler.toml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ConversationView.jsx
│   │   │   ├── MessageThread.jsx
│   │   │   └── ReplyBox.jsx
│   │   ├── pages/
│   │   │   └── Home.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
└── README.md
```

---

## DATABASE DESIGN (for Supabase Example)

### SQL Schema

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT UNIQUE NOT NULL,
  participants TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  last_message TEXT,
  last_message_time TIMESTAMP,
  last_message_type TEXT,
  unread BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT UNIQUE NOT NULL,
  conversation_id TEXT REFERENCES conversations(conversation_id),
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  type TEXT, -- 'incoming' or 'outgoing'
  timestamp TIMESTAMP,
  original_message_id TEXT,
  in_reply_to TEXT,
  references TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## SUCCESS CRITERIA

✅ Emails received at custom domain appear in website inbox within 5 seconds
✅ Email conversations display in proper threaded format (like Gmail)
✅ User can read full conversation history
✅ User can reply to emails from website
✅ Sent emails arrive at recipient with proper threading headers
✅ Gmail notifications work (browser shows notification)
✅ Unread indicators work properly
✅ Search functionality works
✅ Website is responsive and looks professional
✅ No API keys exposed in frontend code

---

## NOTES

- This is a COMPLETE system - everything needed is described above
- AI should ask clarification questions if anything is unclear
- The system is designed to be SIMPLE yet POWERFUL
- Zero-cost (all free tiers of services)
- Can be deployed and shared publicly on GitHub
- Users only need to add their own Resend API key to use it

---

## WHAT AI SHOULD DO

1. **Ask clarifying questions** if anything is unclear
2. **Build Worker first** (test with curl)
3. **Setup Database schema** (create tables/collections)
4. **Build Frontend components** (clean, professional UI)
5. **Connect everything** (frontend → worker → database → Resend)
6. **Test entire flow** (receive email → display → send reply)
7. **Deploy** (worker + frontend)
8. **Provide setup guide** for end users

---

**Ready to build!** 🚀
