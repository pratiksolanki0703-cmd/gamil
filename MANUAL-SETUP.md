# 📧 GAMIL - Manual Setup Guide

> **No terminal needed! Everything through Cloudflare Dashboard.**

---

## 📋 Setup Flow (Follow This Order!)

```
Step 1: Clone Repo
    ↓
Step 2: Create Database (D1) + Run SQL
    ↓
Step 3: Create Worker + Edit worker.js
    ↓
Step 4: Set Variables in Worker
    ↓
Step 5: Setup Email Routing
    ↓
Step 6: Setup Frontend
    ↓
Step 7: Done! 🎉
```

---

## Step 1: Clone or Download Repository

1. Go to: https://github.com/pratiksolanki0703-cmd/gamil
2. Click **"Code"** → **"Download ZIP"**
3. Extract the ZIP file on your computer
4. Keep this folder open - you'll need files from here

---

## Step 2: Create Database (D1) + Run SQL

> **⚠️ DO THIS FIRST!** Worker needs the Database ID.

### 2.1 Create D1 Database

1. Go to: https://dash.cloudflare.com
2. Left sidebar: **Storage & Databases** → **D1**
3. Click **"Create database"**
4. Database Name: `gamil-emails`
5. Click **"Create database"**
6. **📋 COPY the Database ID** (you'll need this in Step 3)

### 2.2 Create Tables (SQL)

1. Click on your new `gamil-emails` database
2. Click **"Console"** tab
3. **📋 COPY the entire SQL below** and paste it:

```sql
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    participants TEXT NOT NULL,
    received_by_email TEXT NOT NULL DEFAULT '',
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    message_id TEXT UNIQUE NOT NULL,
    in_reply_to TEXT,
    email_ref TEXT,
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    body_html TEXT,
    is_read INTEGER DEFAULT 0,
    is_outgoing INTEGER DEFAULT 0,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_message_id ON messages(message_id);
CREATE INDEX IF NOT EXISTS idx_messages_in_reply_to ON messages(in_reply_to);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
```

4. Click **"Execute"**
5. ✅ Wait for "Success" message

---

## Step 3: Create Worker + Edit worker.js

### 3.1 Create Worker

1. Left sidebar: **Compute** → **Workers & Pages**
2. Click **"Create application"**
3. Click **"Create Worker"**
4. Worker Name: `gamil-worker`
5. Click **"Deploy"**

### 3.2 Edit worker.js

1. Click on your worker → Click **"Edit code"**
2. **DELETE everything** in the editor
3. Open the file `worker.js` from your downloaded folder
4. **📋 COPY the entire content** and paste it in the editor

### 3.3 Make Changes in worker.js

**Search for "CHANGE" in the code. You'll find this section:**

```javascript
const CONFIG = {
  domain: "YOUR_DOMAIN",           // CHANGE 1
  emails: "YOUR_EMAILS",           // CHANGE 2
  defaultFromEmail: "YOUR_FROM_EMAIL", // CHANGE 3
  senderName: "YOUR_SENDER_NAME",  // CHANGE 4
};
```

**Make these 4 changes:**

| Line | What to Change | Example |
|------|---------------|---------|
| CHANGE 1 | Your domain name | `"text2tool.in"` |
| CHANGE 2 | Your email addresses (comma separated) | `"hello@text2tool.in,support@text2tool.in"` |
| CHANGE 3 | Default sender email | `"hello@text2tool.in"` |
| CHANGE 4 | Your name or business name | `"Text2Tool"` |

**Example after changes:**

```javascript
const CONFIG = {
  domain: "text2tool.in",
  emails: "hello@text2tool.in,support@text2tool.in",
  defaultFromEmail: "hello@text2tool.in",
  senderName: "Text2Tool",
};
```

5. Click **"Save and deploy"**

---

## Step 4: Set Variables in Worker

### 4.1 Add D1 Database Binding

> **⚠️ D1 Binding is NOT in "Variables and Secrets" - it's in a separate section!**

1. Go to your worker → **Settings** tab
2. Click **"Bindings"** in the left sidebar (NOT "Variables and Secrets")
3. Click **"Add binding"** button
4. Select **"D1 database"**
5. Variable name: `DB`
6. D1 database: Select `gamil-emails`
7. Click **"Add binding"**

### 4.2 Add Secrets

1. Go back to **Settings** tab → **"Variables and Secrets"** section
2. Click **"+ Add"** button → Select **"Secret"**

Add these secrets one by one:

| Secret Name | Value | Where to Get |
|-------------|-------|--------------|
| `RESEND_API_KEY` | `re_xxxxx` | [resend.com](https://resend.com) → API Keys |
| `API_KEY` | `any_random_string` | Make up your own (e.g., `my_secret_key_123`) |

> **⚠️ IMPORTANT:** The `API_KEY` you set here MUST be the SAME key you use in frontend settings (Step 6). Don't forget this!

### 4.3 Add Environment Variables

In the same **"Variables and Secrets"** section, click **"+ Add"** → Select **"Text"**

| Variable Name | Value |
|---------------|-------|
| `FRONTEND_URL` | `*` (or your website URL later) |

4. Click **"Save"**

> **Note:** Email addresses are configured directly in worker.js (CONFIG object), no need for separate variable.

---

## Step 5: Setup Email Routing

> **⚠️ This connects your domain emails to the worker.**

### 5.1 Enable Email Routing

1. Left sidebar: Click on your **domain name**
2. Go to **Email** → **Email Routing**
3. Click **"Get started"**

### 5.2 Add DNS Records

1. Cloudflare will show DNS records to add
2. Click **"Continue"** to add them automatically
3. Click **"Enable"**

### 5.3 Create Email Addresses

1. Go to **"Routing rules"** tab
2. Click **"Create address"**

**Create one address for each email you want:**

| Custom Address | Destination |
|----------------|-------------|
| `hello@yourdomain.com` | Forward to → **gamil-worker** |
| `support@yourdomain.com` | Forward to → **gamil-worker** |
| `admin@yourdomain.com` | Forward to → **gamil-worker** |

3. Click **"Save"** for each

---

## Step 6: Setup Frontend

> **Frontend is a static HTML site - NO build step needed!**

### 6.1 Get Your Worker URL

1. Go to your worker → **Settings** tab
2. Copy the **"Production URL"** (e.g., `https://gamil-worker.your-subdomain.workers.dev`)

### 6.2 Configure Frontend

1. Open `frontend/js/config.js` from your downloaded folder
2. Change these values:

```javascript
const APP_CONFIG = {
  workerUrl: "YOUR_WORKER_URL",  // CHANGE: Your worker URL
  apiKey: "YOUR_API_KEY",        // CHANGE: Your API key from Step 4
};
```

**Or** configure later via the **⚙️ Settings button** in the frontend UI.

### 6.3 Deploy to GitHub Pages (Free)

1. Push your code to GitHub
2. Go to your repo → **Settings** → **Pages**
3. **Source:** Select **"GitHub Actions"**
4. Wait 1-2 minutes for deployment
5. ✅ Done! Your URL: `https://YOUR-USERNAME.github.io/gamil/`

### 6.4 Update CORS in Worker

1. Go back to your worker → **Settings** → **Variables and Secrets**
2. Update `FRONTEND_URL` with your GitHub Pages URL
3. Click **"Save"**

---

## 🎉 Setup Complete!

### Test Your Email System:

1. Send an email to your custom address (e.g., `hello@yourdomain.com`)
2. Wait 1-2 minutes
3. Open your frontend URL
4. ✅ You should see the email!

---

## 📧 Multiple Email Support

GAMIL supports **multiple custom emails** with separate inboxes:

| Email | What Happens |
|-------|--------------|
| `hello@yourdomain.com` | Shows in "Hello" inbox |
| `support@yourdomain.com` | Shows in "Support" inbox |
| `admin@yourdomain.com` | Shows in "Admin" inbox |
| **All Mail** | Shows ALL emails combined |

### To Add More Emails:

1. **Worker:** Update `emails` in worker.js (comma separated)
2. **Cloudflare Variables:** Update `CONFIGURED_EMAILS`
3. **Email Routing:** Add new address → Forward to worker
4. **Frontend:** Refresh - new email will appear in sidebar

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| Emails not arriving | Check Email Routing is enabled, MX records correct |
| Worker error | Check worker logs: Workers & Pages → Logs |
| Frontend shows error | Check `FRONTEND_URL` in worker variables matches your Vercel URL |
| CORS error | Update `FRONTEND_URL` variable in worker settings |

---

## 🔑 Important URLs

| What | Where |
|------|-------|
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Resend API Keys | https://resend.com/api-keys |
| Vercel Dashboard | https://vercel.com/dashboard |
| Your Worker | https://dash.cloudflare.com → Workers & Pages |
| Your D1 Database | https://dash.cloudflare.com → Storage → D1 |

---

**Need help?** Check the README.md or open an issue on GitHub.
