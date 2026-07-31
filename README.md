# 📧 text2tool.in - Email

> A free, self-hosted email management system like Zoho Mail
> 
> **Built by [Pratik Solanki](https://text2tool.in)**

---

A free, self-hosted alternative to Zoho Business Mail. Manage your custom domain emails with a beautiful Gmail-like interface.

## 🌟 Features

- ✅ **Custom Domain Support** - Use any domain (e.g., hello@text2tool.in)
- ✅ **Multiple Email Addresses** - Handle multiple emails per domain
- ✅ **Email Threading** - Conversations are grouped like Gmail
- ✅ **Send & Receive** - Full email functionality via Resend API
- ✅ **Beautiful UI** - Gmail-like interface with glass morphism design
- ✅ **Free Hosting** - GitHub Pages (frontend) + Cloudflare (backend)
- ✅ **No Build Step** - Just edit config and push to GitHub!
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
│           FRONTEND (HTML/CSS/JS on GitHub Pages)        │
│                                                         │
│  - Gmail-like interface                                 │
│  - Inbox, Sent, All Mail views                          │
│  - Search, compose, reply                               │
│  - No build step required!                              │
└─────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

Before you begin, make sure you have:

- [ ] **Cloudflare Account** - [Sign up here](https://dash.cloudflare.com/sign-up)
- [ ] **Resend Account** - [Sign up here](https://resend.com)
- [ ] **GitHub Account** - [Sign up here](https://github.com)
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

### Step 2: Configure Frontend

Edit `frontend/js/config.js` with your details:

```javascript
const APP_CONFIG = {
  // Your Cloudflare Worker URL
  workerUrl: "https://your-worker.workers.dev",
  
  // Your API Key
  apiKey: "your-secret-api-key",
  
  // Display settings (optional)
  domain: "yourdomain.com",
  emails: ["hello@yourdomain.com", "support@yourdomain.com"],
  senderName: "Your Name",
  defaultFromEmail: "hello@yourdomain.com",
};
```

**OR** use the ⚙️ Settings button in the app to configure via UI.

### Step 3: Deploy Frontend (GitHub Pages)

The frontend is a **single HTML file with JS/CSS** - no build step needed!

1. Push your code:
   ```bash
   git push origin main
   ```

2. Go to GitHub → **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Wait for deployment (~1 minute)
5. Your site will be live at:
   ```
   https://YOUR_USERNAME.github.io/gamil/
   ```

> ⚠️ **Important:** Make sure GitHub Pages is enabled in your repo Settings → Pages → Source: "GitHub Actions"

## 📁 Project Structure

```
gamil/
├── worker.js              # ⭐ Cloudflare Worker (main file to edit)
├── setup.sh               # CLI setup script
├── MANUAL-SETUP.md        # Dashboard setup guide
├── README.md              # This file
├── LICENSE                # MIT License
├── .github/workflows/     # GitHub Actions (auto-deploy)
│   └── deploy.yml
├── worker/                # Worker supporting files
│   └── schema.sql         # Database schema
└── frontend/              # Static Frontend (GitHub Pages)
    ├── index.html         # Main entry point
    ├── css/
    │   └── styles.css     # Glass morphism, animations
    └── js/
        ├── config.js      # ⭐ User configuration (EDIT THIS!)
        ├── api.js         # API client for Worker
        ├── utils.js       # Helper functions
        └── app.js         # Alpine.js app logic
```

## 🔧 Configuration Reference

### Frontend Config (`frontend/js/config.js`)

| Variable | Description | Example |
|----------|-------------|---------|
| `workerUrl` | Your Cloudflare Worker URL | `https://gamil-worker.workers.dev` |
| `apiKey` | Your API key (same as Worker secret) | `your-secret-api-key` |
| `domain` | Your custom domain | `text2tool.in` |
| `emails` | Array of email addresses | `["hello@text2tool.in"]` |
| `senderName` | Name shown in sent emails | `Text2Tool` |
| `defaultFromEmail` | Default sender email | `hello@text2tool.in` |

### Worker Config (`worker.js`)

Edit the `CONFIG` object at the top of `worker.js`:

```javascript
const CONFIG = {
  domain: "YOUR_DOMAIN",           // e.g., "text2tool.in"
  emails: "YOUR_EMAILS",           // e.g., "hello@text2tool.in,support@text2tool.in"
  defaultFromEmail: "YOUR_FROM_EMAIL", // e.g., "hello@text2tool.in"
  senderName: "YOUR_SENDER_NAME",  // e.g., "Text2Tool"
};
```

## 💰 Cost Breakdown

This stack is **completely free** for most users:

| Service | Free Tier |
|---------|-----------|
| Cloudflare Workers | 100,000 requests/day |
| Cloudflare D1 | 5GB storage, 5M reads/day |
| Cloudflare Email Routing | Unlimited |
| Resend | 100 emails/day |
| GitHub Pages | 100GB bandwidth/month |

## 🔐 Security Notes

- Never commit your API keys to Git
- Use the ⚙️ Settings button to save API key (stored in browser localStorage)
- Set `FRONTEND_URL` in Worker to your GitHub Pages URL for CORS security
- Example: `wrangler secret put FRONTEND_URL` → enter `https://YOUR_USERNAME.github.io`

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
- Click ⚙️ Settings button and verify Worker URL is correct
- Verify Worker is deployed and accessible
- Check browser console for CORS errors
- Make sure Worker's FRONTEND_URL matches your GitHub Pages URL

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Built By

| | |
|---|---|
| **Developer** | Pratik Solanki |
| **Website** | [text2tool.in](https://text2tool.in) |
| **Email** | pratik@text2tool.in |

---

## 🙏 Credits

- Built with Cloudflare Workers, D1, and Email Routing
- Frontend powered by HTML, CSS, Tailwind CSS CDN, and Alpine.js
- Email sending via Resend
- Glass morphism UI design

---

**Made with ❤️ by [Pratik Solanki](https://text2tool.in) for the community**

⭐ If you find this useful, give it a star on GitHub!
