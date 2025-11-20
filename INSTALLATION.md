# FlowForge - Complete Installation & Setup Guide

## 🎯 Overview

This guide will help you set up and run the entire FlowForge SaaS platform locally and deploy it to production.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **PostgreSQL** 14.x or higher
- **Redis** 6.x or higher
- **Git**

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/AkshatMishra0/FlowForge.git
cd FlowForge
```

### 2. Install Dependencies

```bash
# Install all dependencies for monorepo
npm install

# Install backend dependencies
cd apps/backend
npm install

# Install frontend dependencies
cd ../web
npm install

# Install worker dependencies
cd ../worker
npm install

# Return to root
cd ../..
```

### 3. Set Up Environment Variables

#### Backend (.env)

```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/flowforge?schema=public"
REDIS_URL="redis://localhost:6379"

JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:4000/api/auth/google/callback"

WHATSAPP_PHONE_NUMBER_ID="your-whatsapp-phone-number-id"
WHATSAPP_ACCESS_TOKEN="your-whatsapp-access-token"
WHATSAPP_BUSINESS_ACCOUNT_ID="your-whatsapp-business-id"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your-custom-verify-token"
WHATSAPP_API_VERSION="v18.0"

RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

GOOGLE_CALENDAR_CLIENT_ID="your-calendar-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="your-calendar-client-secret"
GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:4000/api/calendar/callback"

FRONTEND_URL="http://localhost:3000"
PORT=4000
NODE_ENV="development"
```

#### Frontend (.env.local)

```bash
cd ../web
cp .env.example .env.local
```

Edit `apps/web/.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-nextauth-secret-change-this"
NEXT_PUBLIC_API_URL=http://localhost:4000/api

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### Worker (.env)

```bash
cd ../worker
cp .env.example .env
```

Edit `apps/worker/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/flowforge?schema=public"
REDIS_URL="redis://localhost:6379"

WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
WHATSAPP_ACCESS_TOKEN="your-access-token"

FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:4000"
NODE_ENV="development"
```

### 4. Set Up Database

```bash
cd apps/backend

# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed database with sample data
npm run db:seed
```

### 5. Start All Services

Open 3 terminal windows:

#### Terminal 1: Backend API

```bash
cd apps/backend
npm run dev
```

Server will start at http://localhost:4000
API docs at http://localhost:4000/api

#### Terminal 2: Frontend

```bash
cd apps/web
npm run dev
```

Frontend will start at http://localhost:3000

#### Terminal 3: Background Workers

```bash
cd apps/worker
npm run dev
```

Workers will process queued jobs

## 🔧 Third-Party Service Setup

### WhatsApp Cloud API

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app and select "Business" type
3. Add WhatsApp product
4. Get your:
   - Phone Number ID
   - Access Token
   - Business Account ID
5. Set webhook URL: `https://your-domain.com/api/whatsapp/webhook`
6. Set webhook verify token (use a random string)
7. Subscribe to `messages` webhook field

### Razorpay

1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Settings → API Keys
3. Generate Test/Live keys
4. Enable Payment Links feature
5. Copy Key ID and Key Secret

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:4000/api/auth/google/callback` (dev)
   - `https://your-domain.com/api/auth/google/callback` (prod)

### Google Calendar API

1. In Google Cloud Console (same project)
2. Enable Google Calendar API
3. Use same OAuth credentials or create new ones
4. Add scopes: `calendar.readonly`, `calendar.events`

## 📦 Production Deployment

### Database (Supabase/NeonDB)

#### Supabase

```bash
1. Sign up at https://supabase.com
2. Create new project
3. Copy connection string
4. Update DATABASE_URL in production env
```

#### NeonDB

```bash
1. Sign up at https://neon.tech
2. Create new project
3. Copy connection string
4. Update DATABASE_URL in production env
```

### Redis (Upstash/Redis Cloud)

#### Upstash

```bash
1. Sign up at https://upstash.com
2. Create Redis database
3. Copy REDIS_URL
4. Update in production env
```

### Backend Deployment (Railway)

```bash
cd apps/backend

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Add environment variables in Railway dashboard

# Deploy
railway up
```

#### Alternative: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Set secrets
fly secrets set DATABASE_URL="your-url"
fly secrets set REDIS_URL="your-url"
# ... set all other env vars

# Deploy
fly deploy
```

### Frontend Deployment (Vercel)

```bash
cd apps/web

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Go to Project Settings → Environment Variables
```

### Worker Deployment (Railway/Fly.io)

Follow same steps as backend deployment, but for the worker directory.

## 🧪 Running Tests

```bash
# Backend tests
cd apps/backend
npm run test

# Frontend tests
cd apps/web
npm run test
```

## 📊 Database Management

### View Database (Prisma Studio)

```bash
cd apps/backend
npm run db:studio
```

Opens at http://localhost:5555

### Create Migration

```bash
cd apps/backend
npm run db:migrate
```

### Reset Database

```bash
cd apps/backend
npx prisma migrate reset
```

## 🔍 Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d flowforge

# Check if database exists
\l

# Create database if needed
CREATE DATABASE flowforge;
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping

# Should return PONG
```

### WhatsApp Webhook Not Working

1. Ensure webhook URL is publicly accessible (use ngrok for local testing)
2. Verify webhook token matches in Meta dashboard and .env
3. Check webhook logs in Meta dashboard

### Port Already in Use

```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use different port in .env
PORT=4001
```

## 📁 Project Structure

```
flowforge/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── business/ # Business management
│   │   │   ├── whatsapp/ # WhatsApp integration
│   │   │   ├── invoice/  # Invoice & payment
│   │   │   ├── booking/  # Booking system
│   │   │   ├── lead/     # CRM/Lead management
│   │   │   ├── dashboard/# Dashboard APIs
│   │   │   └── prisma/   # Database service
│   │   └── prisma/
│   │       └── schema.prisma
│   ├── web/              # Next.js frontend
│   │   └── src/
│   │       ├── app/      # App router pages
│   │       ├── components/# React components
│   │       └── lib/      # Utilities
│   └── worker/           # Background jobs
│       └── src/
│           ├── workers/  # Job processors
│           └── index.ts  # Worker entry
├── package.json          # Root package.json
└── turbo.json           # Monorepo config
```

## 🎨 Key Features Implemented

✅ User authentication (Email/Password + Google OAuth)  
✅ Business profile management  
✅ WhatsApp Cloud API integration  
✅ Automated message sending  
✅ Webhook handling for incoming messages  
✅ Lead/CRM management  
✅ Invoice creation with Razorpay  
✅ Payment link generation  
✅ Automated payment reminders  
✅ Booking system  
✅ Google Calendar sync (structure ready)  
✅ Dashboard with analytics  
✅ Background job processing (BullMQ)  
✅ RESTful API with Swagger docs  
✅ Responsive UI with TailwindCSS  

## 📝 Next Steps

1. **Run migrations**: `npm run db:migrate`
2. **Start services**: Run backend, frontend, and worker
3. **Create account**: Sign up at http://localhost:3000
4. **Configure business**: Add WhatsApp and Razorpay credentials
5. **Test features**: Create leads, send messages, generate invoices

## 🆘 Support

For issues and questions:
- Check [GitHub Issues](https://github.com/AkshatMishra0/FlowForge/issues)
- Read API documentation at http://localhost:4000/api
- Review Prisma schema for database structure

## 📄 License

MIT License - see LICENSE file

---

**Built with ❤️ for local businesses**
