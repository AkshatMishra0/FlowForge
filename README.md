# FlowForge 🚀

**WhatsApp Automation + Smart Invoicing + Payment Reminder SaaS for Local Businesses**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/AkshatMishra0/FlowForge?style=social)](https://github.com/AkshatMishra0/FlowForge)
[![CI](https://github.com/AkshatMishra0/FlowForge/workflows/CI/badge.svg)](https://github.com/AkshatMishra0/FlowForge/actions)

## 🌟 Features

- 📱 **WhatsApp Automation** - Send automated follow-ups and messages
- 📊 **Mini CRM** - Manage leads and customer relationships
- 💰 **Smart Invoicing** - Create invoices with Razorpay payment links
- ⏰ **Payment Reminders** - Automated WhatsApp reminders for overdue payments
- 📅 **Appointment Booking** - Customer self-service booking system
- 🔄 **Google Calendar Sync** - Automatic calendar integration
- 📈 **Analytics Dashboard** - Track leads, payments, bookings, and messages

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** + **shadcn/ui**
- **Zustand** (State Management)
- **React Query** (Data Fetching)
- **NextAuth.js** (Authentication)

### Backend
- **NestJS** (Node.js Framework)
- **TypeScript**
- **Prisma ORM** (Database)
- **BullMQ** (Job Queue)
- **Redis**
- **WhatsApp Cloud API**
- **Razorpay API**
- **Google Calendar API**

### Database
- **PostgreSQL**
- **Redis**

## 📁 Project Structure

```
flowforge/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── backend/          # NestJS API server
│   └── worker/           # BullMQ background workers
├── packages/
│   ├── database/         # Prisma schema
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared configuration
└── turbo.json            # Monorepo configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AkshatMishra0/FlowForge.git
cd flowforge
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

4. **Set up database**
```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed database
npm run db:seed
```

5. **Start development servers**
```bash
# Start all services (frontend, backend, worker)
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api

### Production Build

```bash
npm run build
```

## 📦 Deployment

### Frontend (Vercel)
```bash
cd apps/web
vercel
```

### Backend (Railway/Fly.io)
```bash
cd apps/backend
# Follow Railway or Fly.io deployment guides
```

### Database (Supabase/NeonDB)
- Create a PostgreSQL instance
- Update DATABASE_URL in environment variables

### Redis (Upstash/Redis Cloud)
- Create a Redis instance
- Update REDIS_URL in environment variables

## 🔑 Environment Variables

See `.env.example` for all required environment variables.

### Key Services Setup

#### WhatsApp Cloud API
1. Create a Meta Developer account
2. Create a WhatsApp Business App
3. Get your Phone Number ID and Access Token
4. Set webhook URL to: `https://your-domain.com/api/whatsapp/webhook`

#### Razorpay
1. Create a Razorpay account
2. Get API Key ID and Secret from Dashboard
3. Enable Payment Links feature

#### Google Calendar API
1. Create a Google Cloud Project
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs

## 📚 API Documentation

API documentation is available at `/api` when running the backend server.

### Key Endpoints

```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me

POST   /api/whatsapp/send
POST   /api/whatsapp/webhook
GET    /api/whatsapp/templates

POST   /api/invoices
GET    /api/invoices/:id
PATCH  /api/invoices/:id/status

POST   /api/bookings
GET    /api/bookings/slots
PATCH  /api/bookings/:id

GET    /api/leads
POST   /api/leads
PATCH  /api/leads/:id

GET    /api/dashboard/stats
GET    /api/dashboard/analytics
```

## 🛠️ Development

### Database Management

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes (dev)
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Code Quality

```bash
# Lint
npm run lint

# Type check
npm run type-check

# Format
npm run format
```

## 📄 License

MIT

## 🤝 Support

For issues and questions, please open an issue on GitHub.
