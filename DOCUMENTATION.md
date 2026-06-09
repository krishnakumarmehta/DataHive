# DataHive - AI-Powered Business Management Platform
## Complete Documentation & Setup Guide

---

## 📋 Project Overview

DataHive ek comprehensive business management platform hai jisme har businessman ko ek personalized AI chatbot assistant milta hai. Ye chatbot sirf usi businessman ke business data ke based par trained hota hai aur customers, orders, products, sales - sab ke baare mein intelligent answers deta hai.

---

## 🎯 Features List

### ✅ Already Built (Frontend - Ready to Use)

| Feature | Description |
|---------|------------|
| 🔐 **Authentication** | Login & Multi-step Registration with business details |
| 📊 **Dashboard** | Revenue charts, order stats, recent activity, analytics |
| 📦 **Products Management** | Add, edit, delete products. Grid & list view. Search & filter |
| 📋 **Orders Management** | Track orders, update status, filter by status tabs |
| 👥 **Customer Management** | Customer cards with stats, CRUD operations |
| 💰 **Sales & Analytics** | Revenue trends, profit margins, pie charts, top customers |
| 📁 **Documents Management** | Upload PDFs, categorize, download. Category wise sorting |
| 🤖 **AI Chatbot Assistant** | Floating chat widget, Hindi/English support, business queries |
| ⚙️ **Settings** | Profile, Business info, Notifications, API keys, Security |
| 📱 **Responsive Design** | Works on mobile, tablet, and desktop |
| 🎨 **Dark Theme** | Premium dark UI with glassmorphism effects |
| 💾 **Data Persistence** | LocalStorage based data saving |

### 🔧 Needs External Setup (For Production)

| Feature | What's Needed | Cost |
|---------|--------------|------|
| 🤖 Real AI Chatbot | OpenAI/Gemini API Key | ₹400-1500/month |
| 🗄️ Database | MongoDB Atlas / Supabase | Free tier available |
| 📧 Email Integration | Gmail API / SendGrid | Free tier available |
| 📤 File Storage | Cloudinary / AWS S3 | Free tier available |
| 🌐 Hosting | Vercel / Netlify + Railway | Free tier available |
| 🔒 Real Authentication | Firebase Auth / Auth0 | Free tier available |

---

## 🚀 Quick Start Guide

### Step 1: Prerequisites
```
- Node.js 18+ installed (https://nodejs.org)
- npm (comes with Node.js)
- VS Code or any code editor
```

### Step 2: Run the Project
```bash
cd DataHive/DataHive
npm install
npm run dev
```

### Step 3: Open in Browser
```
http://localhost:5173
```

### Step 4: Demo Login
```
Email: demo@datahive.com
Password: demo123
```

Or register a new account with your business details!

---

## 🤖 AI Chatbot - How It Works

### Current (Demo Mode)
- Pattern matching based responses
- Understands Hindi & English queries
- Responds based on your actual business data (products, orders, customers, sales)
- No API key needed

### Example Queries:
```
✅ "Kitne products hain?"
✅ "Pending orders dikhao"
✅ "Top customers kaun hain?"
✅ "Is mahine ki revenue kitni hai?"
✅ "Business ka summary batao"
✅ "Rahul ka detail batao" (specific customer search)
✅ "ORD-2024-001 ka status" (specific order search)
✅ "Out of stock products dikhao"
```

### Production Mode (Real AI) - Setup Guide

#### Option A: OpenAI (GPT)
1. Go to https://platform.openai.com
2. Create account & add billing
3. Generate API key
4. Paste in Settings → API & Integrations
5. Cost: ~$5-20/month

#### Option B: Google Gemini
1. Go to https://ai.google.dev
2. Create API key (free tier available!)
3. Paste in Settings → API & Integrations
4. Cost: Free (15 req/min) or ~₹500/month for more

---

## 🗄️ Backend Setup Guide (For Production)

### Option 1: Supabase (Recommended - Easiest)

```bash
# 1. Go to https://supabase.com and create project
# 2. Get your project URL and API key
# 3. Install Supabase client
npm install @supabase/supabase-js

# 4. Create .env file
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_KEY=your_anon_key
```

Database Tables to Create:
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  business_name TEXT,
  business_type TEXT,
  phone TEXT,
  city TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  category TEXT,
  price DECIMAL,
  stock INTEGER,
  sku TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  customer_name TEXT,
  items JSONB,
  total DECIMAL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  type TEXT,
  size TEXT,
  category TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Option 2: MongoDB Atlas

```bash
# 1. Go to https://mongodb.com/atlas
# 2. Create free cluster
# 3. Get connection string
# 4. Install dependencies
npm install mongoose express cors dotenv

# 5. Create backend server (server.js)
```

---

## 📧 Email Integration Setup

### Gmail Integration
```bash
# 1. Enable 2-Factor Authentication in Gmail
# 2. Generate App Password: https://myaccount.google.com/apppasswords
# 3. Install nodemailer
npm install nodemailer

# 4. Use in backend:
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your@gmail.com',
    pass: 'your_app_password'
  }
});
```

### SendGrid (Alternative)
```bash
# 1. Create account at https://sendgrid.com
# 2. Get API key
# 3. Install: npm install @sendgrid/mail
```

---

## 🌐 Deployment Guide

### Frontend Deployment (Vercel - Free)

```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/datahive.git
git push -u origin main

# 2. Go to https://vercel.com
# 3. Import your GitHub repository
# 4. Click Deploy
# 5. Your site is live at: https://datahive.vercel.app
```

### Backend Deployment (Railway - Free)

```bash
# 1. Go to https://railway.app
# 2. Connect GitHub repository
# 3. Add environment variables
# 4. Deploy automatically
```

---

## 📁 Project Structure

```
DataHive/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/          → Sidebar, Header, Layout
│   │   └── chatbot/         → AI Chat Widget
│   ├── pages/               → All page components
│   ├── context/             → Auth & Business state management
│   ├── data/                → Mock data
│   ├── utils/               → Helpers & Chat Engine
│   ├── App.jsx              → Main app with routing
│   ├── index.css            → Design system
│   └── main.jsx             → Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔑 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 19 | UI Framework |
| Vite 6 | Build Tool |
| React Router v7 | Navigation |
| Recharts | Charts & Analytics |
| Lucide React | Icons |
| CSS3 | Styling (Dark Theme, Glassmorphism) |
| LocalStorage | Data Persistence (Demo) |

---

## 📝 Important Notes

1. **Current Version** = Frontend demo with mock data & pattern-based chatbot
2. **Production Ready** = Backend + Database + Real AI API needed
3. **Data is per-device** = LocalStorage data doesn't sync across devices
4. **AI Chatbot** = Currently pattern-matching, upgrade to real AI with API key
5. **Multi-tenant** = Each registered user gets separate data space

---

## 🆘 Support & Issues

- All business data is stored in browser's LocalStorage
- To reset data: Clear browser storage or use incognito mode
- For production deployment, follow the Backend Setup Guide above

---

*Built with ❤️ by DataHive Team*
