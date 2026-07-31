# 📧 GAMIL - Self-Hosted Email Management System

A free, self-hosted alternative to Zoho Business Mail. Manage your custom domain emails with a beautiful Gmail-like interface.

## 🌟 Features

- ✅ **Custom Domain Support** - Use any domain (e.g., hello@text2tool.in)
- ✅ **Multiple Email Addresses** - Handle multiple emails per domain
- ✅ **Email Threading** - Conversations are grouped like Gmail
- ✅ **Send & Receive** - Full email functionality via Resend API
- ✅ **Beautiful UI** - Modern, responsive interface with Tailwind CSS
- ✅ **Free Hosting** - Deploy to Vercel (frontend) + Cloudflare (backend)
- ✅ **Open Source** - Fork, customize, and deploy your own instance

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR CUSTOM DOMAIN                    │
│                  (e.g., hello@text2tool.in)              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              CLOUDFLARE EMAIL ROUTING                    │
│         (Receive emails → Forward to Worker)             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              CLOUDFLARE WORKER (Backend API)             │
│                                                         │
│  /api/receive-email  → Store in D1                      │
│  /api/send-email     → Send via Resend → Store in D1    │
│  /api/conversations  → Fetch from D1                    │
│  /api/mark-read      → Update D1                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  CLOUDFLARE D1 (Database)                │
│                                                         │
│  conversations table (threading support)                │
│  messages table (full email content)                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js on Vercel)                │
│                                                         │
│  - Gmail-like interface                                 │
│  - Conversation threading                               │
│  - Search, compose, reply                               │
└─────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

Before you begin, make sure you have:

- [ ] **Cloudflare Account** - [Sign up here](https://dash.cloudflare.com/sign-up)
- [ ] **Resend Account** - [Sign up here](https://resend.com)
- [ ] **Vercel Account** - [Sign up here](https://vercel.com)
- [ ] **Custom Domain** - Added to your Cloudflare account

## 🚀 Quick Start

### Choose Your Setup Method:

| Method | Best For | Difficulty |
|--------|----------|------------|
| **Option 1: CLI (Recommended)** | Developers who are comfortable with terminal | ⭐ Easy |
| **Option 2: Manual (Dashboard)** | Non-technical users who prefer visual interface | ⭐ Easy |

---

### Option 1: CLI Setup (Recommended)

#### Step 1: Fork & Clone

1. Fork this repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/gamil.git
   cd gamil
   ```

#### Step 2: Run Setup Script

```bash
bash setup.sh
```

This will automatically:
- ✅ Install Wrangler CLI (if not installed)
- ✅ Login to Cloudflare
- ✅ Create D1 Database
- ✅ Initialize database tables
- ✅ Set up environment variables
- ✅ Deploy Cloudflare Worker

---

### Option 2: Manual Setup (No Terminal!)

> **Terminal ki zaroorat NAHI hai!** Sab kuch Cloudflare Dashboard se hoga.

📄 **Detailed Guide:** [MANUAL-SETUP.md](MANUAL-SETUP.md)

Quick Summary:
1. **D1 Database:** Dashboard → Storage → D1 → Create → SQL run karo
2. **Worker:** Dashboard → Workers → Create → Code paste karo
3. **Secrets:** Worker Settings → Variables → Add karo
4. **Email Routing:** Domain → Email → Routing enable karo

### Step 2: Configure

Edit `config.js` with your details:

```javascript
export default {
  domain: "yourdomain.com",
  emails: [
    "hello@yourdomain.com",
    "support@yourdomain.com"
  ],
  defaultFromEmail: "hello@yourdomain.com",
  senderName: "Your Name",
  workerUrl: "https://your-worker.workers.dev", // Will fill after deploying worker
  frontendUrl: "https://your-app.vercel.app",   // Will fill after deploying frontend
  cloudflareAccountId: "YOUR_ACCOUNT_ID",
  d1DatabaseId: "YOUR_DATABASE_ID",             // Will fill after creating D1
  resendApiKey: "YOUR_RESEND_API_KEY",
};
```

### Step 3: Setup Cloudflare Worker

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Create D1 Database:
   ```bash
   cd worker
   wrangler d1 create gamil-emails
   ```

4. Copy the database ID and add it to `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "gamil-emails"
   database_id = "YOUR_DATABASE_ID_HERE"
   ```

5. Initialize Database:
   ```bash
   wrangler d1 execute gamil-emails --file=./schema.sql
   ```

6. Set Environment Variables:
   ```bash
   wrangler secret put RESEND_API_KEY
   wrangler secret put FRONTEND_URL
   wrangler secret put API_KEY
   wrangler secret put CONFIGURED_EMAILS
   ```

   > **Note:** Generate a secure API_KEY for authentication. Example:
   > ```bash
   > wrangler secret put API_KEY
   > # Enter a secure random string when prompted
   > ```
   
   > **Note:** CONFIGURED_EMAILS is a comma-separated list of email addresses:
   > ```bash
   > wrangler secret put CONFIGURED_EMAILS
   > # Enter: hello@yourdomain.com,support@yourdomain.com
   > ```

7. Deploy Worker:
   ```bash
   wrangler deploy
   ```

8. Copy your worker URL (e.g., `https://gamil-worker.YOUR_SUBDOMAIN.workers.dev`)

### Step 4: Setup Cloudflare Email Routing

1. Go to Cloudflare Dashboard → Select your domain
2. Navigate to **Email** → **Email Routing**
3. Enable Email Routing
4. Add DNS records as instructed (MX and TXT records)
5. Create email addresses (e.g., `hello@yourdomain.com`)
6. Set destination to your Worker

### Step 5: Setup Resend

1. Go to [Resend Dashboard](https://resend.com)
2. Add your domain and verify DNS records
3. Create an API key
4. Add the API key to your Worker environment variables

### Step 6: Deploy Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Update `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-worker.workers.dev
   ```

3. Deploy to Vercel:
   ```bash
   npm i -g vercel
   vercel
   ```

4. Update `config.js` with your Vercel URL

## 🔧 Configuration Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `domain` | Your custom domain | `text2tool.in` |
| `emails` | Array of email addresses to handle | `["hello@text2tool.in"]` |
| `defaultFromEmail` | Default sender email | `hello@text2tool.in` |
| `senderName` | Name shown in sent emails | `Text2Tool` |
| `workerUrl` | Your Cloudflare Worker URL | `https://gamil-worker.workers.dev` |
| `frontendUrl` | Your Vercel deployment URL | `https://gamil.vercel.app` |
| `cloudflareAccountId` | Your Cloudflare Account ID | `abc123...` |
| `d1DatabaseId` | Your D1 Database ID | `xyz789...` |
| `resendApiKey` | Your Resend API Key | `re_abc123...` |

## 📁 Project Structure

```
gamil/
├── config.js              # Configuration file (EDIT THIS!)
├── .env.example           # Environment variables template
├── README.md              # This file
├── worker/                # Cloudflare Worker (Backend)
│   ├── wrangler.toml      # Worker configuration
│   ├── package.json       # Worker dependencies
│   ├── schema.sql         # Database schema
│   └── src/
│       ├── index.js       # Main worker entry
│       └── endpoints/
│           ├── receive-email.js
│           ├── send-email.js
│           ├── conversations.js
│           ├── mark-read.js
│           └── helpers.js
└── frontend/              # Next.js Frontend
    ├── package.json
    ├── tailwind.config.js
    ├── app/
    │   ├── layout.js
    │   ├── page.js
    │   └── globals.css
    └── components/
        ├── Sidebar.js
        ├── ConversationView.js
        ├── ReplyBox.js
        └── EmptyState.js
```

## 💰 Cost Breakdown

This stack is **completely free** for most users:

| Service | Free Tier |
|---------|-----------|
| Cloudflare Workers | 100,000 requests/day |
| Cloudflare D1 | 5GB storage, 5M reads/day |
| Cloudflare Email Routing | Unlimited |
| Resend | 100 emails/day |
| Vercel | 100GB bandwidth/month |

## 🔐 Security Notes

- Never commit your API keys to Git
- Use `wrangler secret put` for sensitive variables
- The frontend uses CORS to protect your API
- Consider adding authentication if making public

## 🐛 Troubleshooting

**Emails not receiving?**
- Check Cloudflare Email Routing is enabled
- Verify MX records are correct
- Check Worker logs: `wrangler tail`

**Emails not sending?**
- Verify Resend API key is correct
- Check domain is verified in Resend
- Check Worker logs for errors

**Frontend not loading?**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify Worker is deployed and accessible
- Check browser console for CORS errors

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Credits

- Built with Cloudflare Workers, D1, and Email Routing
- Frontend powered by Next.js and Tailwind CSS
- Email sending via Resend

---

**Made with ❤️ for the community**
