# FlowForge 🚀

**Modern SaaS Platform for Local Businesses: WhatsApp Automation + Smart Invoicing + CRM + Booking System**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/AkshatMishra0/FlowForge?style=social)](https://github.com/AkshatMishra0/FlowForge)
[![CI](https://github.com/AkshatMishra0/FlowForge/workflows/CI/badge.svg)](https://github.com/AkshatMishra0/FlowForge/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/AkshatMishra0/FlowForge/pulls)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-E0234E)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

---

## 🌟 Features

### Core Functionality
- 📱 **WhatsApp Automation** - Send automated messages, follow-ups, and notifications via WhatsApp Cloud API
- 💼 **Mini CRM** - Complete lead management with status tracking, assignment, and activity logs
- 💰 **Smart Invoicing** - Create professional invoices with integrated Razorpay payment links
- ⏰ **Payment Reminders** - Automated WhatsApp reminders for overdue payments (same day, 1-day, 7-day)
- 📅 **Appointment Booking** - Customer self-service booking system with confirmation emails
- 🔄 **Google Calendar Sync** - Automatic two-way calendar synchronization
- 📈 **Analytics Dashboard** - Real-time insights on leads, revenue, bookings, and messages

### Advanced Features (February 2026 Updates)
- 🔒 **Enterprise Security** - Role-based access control (RBAC) with granular permissions
- 🛡️ **Rate Limiting** - Intelligent login protection with automatic blocking and user tracking
- 🔍 **Advanced Search** - Global search across all entities with smart suggestions and filters
- 📊 **Comprehensive Reports** - Revenue analytics, lead conversion tracking, CSV/JSON exports
- ⚡ **Bulk Operations** - Manage multiple leads, invoices, and bookings efficiently
- 📧 **Email Service** - Professional HTML email templates for invoices and bookings
- 📊 **Performance Monitoring** - Real-time performance tracking with metrics and bottleneck detection
- 💬 **Message Interface** - WhatsApp-style chat interface for customer communications
- 🏥 **Health Monitoring** - Advanced health checks with system metrics and historical tracking
- 🔐 **Enhanced Logging** - Request logging with security, metrics, and sensitive data redaction

### Developer Experience
- 🎨 **UI Component Library** - Comprehensive set of reusable React components
- 🪝 **Custom React Hooks** - useAsync, useDebounce, useLocalStorage, useMediaQuery
- 📝 **API Documentation** - Complete Swagger/OpenAPI documentation
- ✅ **Comprehensive Testing** - Unit tests, E2E tests, and integration tests
- 🔧 **Developer Tools** - Makefile for common tasks, EditorConfig for consistency
- 🔍 **Type Safety** - 100% TypeScript with strict mode enabled
- 📋 **Environment Validation** - Automatic validation of environment variables

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

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AkshatMishra0/FlowForge.git
cd flowforge
```

2. **Install dependencies**
```bash
make install
# or
npm install
```

3. **Set up environment variables**
```bash
make setup
# or manually:
cp .env.example .env
# Edit .env with your actual credentials
```

4. **Set up database**
```bash
# Start PostgreSQL and Redis with Docker (recommended)
make docker-up
# or
docker-compose up -d

# Run migrations
make migrate
# or
cd apps/backend && npx prisma migrate dev

# (Optional) Seed database with sample data
make seed
```

5. **Start development servers**
```bash
# Start all services (frontend, backend, worker)
make dev
# or
npm run dev
```

Access the application:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Docs (Swagger):** http://localhost:4000/api/docs
- **Prisma Studio:** `make db-studio`

### Using Makefile Commands

FlowForge includes a Makefile for common development tasks:

```bash
# Development
make dev          # Start all services
make build        # Build all applications
make test         # Run tests
make lint         # Lint code
make format       # Format code

# Database
make migrate      # Run migrations
make seed         # Seed database
make db-studio    # Open Prisma Studio

# Docker
make docker-up    # Start Docker services
make docker-down  # Stop Docker services
make docker-logs  # View logs

# Utilities
make clean        # Clean build artifacts
make help         # Show all available commands
```

See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for detailed development instructions.

### Production Build

```bash
npm run build
npm start
```

### Production Deployment with PM2

```bash
# Install PM2
npm install -g pm2

# Start all services
pm2 start ecosystem.config.js

# Monitor services
pm2 monit

# View logs
pm2 logs
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

// Updated documentation with new features - Modified: 2025-12-25 20:07:26
// Added lines for commit changes
// Change line 1 for this commit
// Change line 2 for this commit
// Change line 3 for this commit
// Change line 4 for this commit
// Change line 5 for this commit
// Change line 6 for this commit
// Change line 7 for this commit
// Change line 8 for this commit
// Change line 9 for this commit
// Change line 10 for this commit
// Change line 11 for this commit
// Change line 12 for this commit
// Change line 13 for this commit
// Change line 14 for this commit
// Change line 15 for this commit
// Change line 16 for this commit
// Change line 17 for this commit
// Change line 18 for this commit

// Updated README with latest features - Modified: 2025-12-25 20:07:40
// Added lines for commit changes
// Change line 1 for this commit
// Change line 2 for this commit
// Change line 3 for this commit
// Change line 4 for this commit
// Change line 5 for this commit
// Change line 6 for this commit
// Change line 7 for this commit
// Change line 8 for this commit
// Change line 9 for this commit
// Change line 10 for this commit
// Change line 11 for this commit
// Change line 12 for this commit
// Change line 13 for this commit
