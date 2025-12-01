# FlowForge - Complete Setup & Usage Guide

## 🎯 Project Overview

**FlowForge** is a SaaS platform for local businesses providing:
- WhatsApp automation & messaging
- CRM for lead management
- Smart invoicing with Razorpay payment links
- Payment reminders via WhatsApp
- Appointment booking system
- Google Calendar integration
- Analytics dashboard

---

## 📋 Current Status

### ✅ What's Already Completed

1. **Project Structure**
   - Monorepo setup with Turborepo
   - Backend (NestJS) with complete API structure
   - Frontend (Next.js 14) with App Router
   - Worker service for background jobs
   - Database schema (Prisma)

2. **Backend Modules Implemented**
   - ✅ Authentication (JWT + Google OAuth)
   - ✅ Business Management
   - ✅ Lead/CRM System
   - ✅ Invoice Management
   - ✅ Booking System
   - ✅ WhatsApp Integration
   - ✅ Dashboard/Analytics

3. **Database Schema**
   - Complete Prisma schema with all models
   - Users, Businesses, Leads, Invoices, Bookings
   - Message logs, Follow-up sequences
   - Payment reminders, Scheduled jobs

4. **Configuration**
   - Environment files set up
   - Docker Compose for local development
   - PM2 configuration for production
   - GitHub Actions CI/CD workflow

---

## 🚀 Setup Instructions

### Prerequisites

- ✅ Node.js 18+ (You have v24.4.0 ✓)
- ❌ Docker Desktop (NOT installed - needed for PostgreSQL & Redis)
- ❌ PostgreSQL 14+ (or use Docker)
- ❌ Redis 6+ (or use Docker)

### Option 1: With Docker (Recommended)

**1. Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop
   - Verify: `docker --version`

**2. Start Database Services**
```powershell
cd c:\Users\admin\Desktop\flowforge
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

**3. Generate Prisma Client & Run Migrations**
```powershell
npm run db:generate
npm run db:migrate
```

**4. (Optional) Seed Database**
```powershell
npm run db:seed
```

**5. Start Development Servers**
```powershell
npm run dev
```

### Option 2: Without Docker (Manual Setup)

**1. Install PostgreSQL**
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, set password to `postgres`
   - Create database: `flowforge`

**2. Install Redis**
   - Download from: https://github.com/microsoftarchive/redis/releases
   - Or use Memurai (Redis for Windows): https://www.memurai.com/

**3. Update Environment Variables**
   - Update `apps/backend/.env` with your PostgreSQL connection string
   - Update `apps/worker/.env` with your PostgreSQL connection string

**4. Generate Prisma Client & Run Migrations**
```powershell
cd apps\backend
npm run db:generate
npm run db:migrate
cd ..\..
```

**5. Start Development Servers**
```powershell
npm run dev
```

---

## 🔧 Environment Configuration

### Critical Environment Variables to Update

#### Backend (`apps/backend/.env`)

**MUST CONFIGURE** (Currently using placeholders):
```env
# WhatsApp Cloud API - Get from Meta Developer Portal
WHATSAPP_PHONE_NUMBER_ID="your-actual-phone-number-id"
WHATSAPP_ACCESS_TOKEN="your-actual-whatsapp-access-token"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="create-a-random-token"

# Razorpay - Get from Razorpay Dashboard
RAZORPAY_KEY_ID="your-actual-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-actual-razorpay-key-secret"

# JWT - Generate a secure random string
JWT_SECRET="generate-a-secure-random-32-char-string"

# Google OAuth (Optional) - Get from Google Cloud Console
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

#### Frontend (`apps/web/.env.local`)
```env
NEXTAUTH_SECRET="generate-a-different-secure-random-string"
```

### How to Get API Keys

#### 1. WhatsApp Cloud API (Meta)
1. Go to https://developers.facebook.com/
2. Create an app → Business → WhatsApp
3. Get Phone Number ID from WhatsApp → Getting Started
4. Get Access Token (temporary for testing, permanent for production)
5. Set up Webhook URL: `https://your-domain.com/api/whatsapp/webhook`

#### 2. Razorpay
1. Sign up at https://razorpay.com/
2. Go to Settings → API Keys
3. Generate Test Keys (for development)
4. For production, complete KYC and generate Live Keys

#### 3. Google OAuth (Optional)
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:4000/api/auth/google/callback`

#### 4. Google Calendar API (Optional)
1. In the same Google Cloud project
2. Enable Google Calendar API
3. Use the same OAuth credentials or create new ones

---

## 🏃 Running the Application

### Development Mode

```powershell
# Start all services (backend, frontend, worker)
npm run dev
```

Access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **API Documentation**: http://localhost:4000/api (Swagger UI)

### Individual Services

```powershell
# Backend only
cd apps\backend
npm run dev

# Frontend only
cd apps\web
npm run dev

# Worker only
cd apps\worker
npm run dev
```

### Production Mode

```powershell
# Build all apps
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs
```

---

## 📱 How to Use FlowForge

### 1. Sign Up & Create Account

**Step 1: Register**
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Enter email, password, and name
4. Or use "Sign in with Google"

**API Endpoint:**
```bash
POST http://localhost:4000/api/auth/signup
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "securepassword",
  "name": "Your Name"
}
```

### 2. Create Your Business Profile

**Step 2: Set Up Business**
1. After login, go to Settings → Business Profile
2. Fill in business details:
   - Business name
   - Address, phone, WhatsApp number
   - Email, website
   - Timezone (default: Asia/Kolkata)
   - Currency (default: INR)

**API Endpoint:**
```bash
POST http://localhost:4000/api/business
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "name": "My Local Business",
  "phone": "+919876543210",
  "whatsappNumber": "+919876543210",
  "email": "business@example.com",
  "address": "123 Main St, City"
}
```

### 3. Configure Integrations

**Step 3: Add API Keys**
1. Go to Settings → Integrations
2. Add WhatsApp credentials
3. Add Razorpay credentials
4. (Optional) Connect Google Calendar

**API Endpoint:**
```bash
PATCH http://localhost:4000/api/business/{businessId}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "whatsappPhoneNumberId": "your-phone-number-id",
  "whatsappAccessToken": "your-access-token",
  "razorpayKeyId": "rzp_test_...",
  "razorpayKeySecret": "your-secret"
}
```

### 4. Manage Leads (CRM)

**Add New Lead**
```bash
POST http://localhost:4000/api/leads
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+919876543210",
  "email": "john@example.com",
  "source": "website",
  "status": "new",
  "notes": "Interested in product A"
}
```

**List Leads**
```bash
GET http://localhost:4000/api/leads?status=new&page=1&limit=10
Authorization: Bearer {your_jwt_token}
```

**Update Lead Status**
```bash
PATCH http://localhost:4000/api/leads/{leadId}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "status": "qualified"
}
```

### 5. Send WhatsApp Messages

**Send Message to Lead**
```bash
POST http://localhost:4000/api/whatsapp/send
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "phone": "+919876543210",
  "message": "Hi John, thanks for your interest!"
}
```

**Send Template Message**
```bash
POST http://localhost:4000/api/whatsapp/send-template
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "phone": "+919876543210",
  "templateName": "hello_world",
  "languageCode": "en"
}
```

### 6. Create Invoices

**Create Invoice**
```bash
POST http://localhost:4000/api/invoices
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "+919876543210",
  "customerEmail": "john@example.com",
  "items": [
    {
      "description": "Product A",
      "quantity": 2,
      "unitPrice": 1000
    }
  ],
  "tax": 180,
  "discount": 0,
  "dueDate": "2025-12-15T00:00:00Z",
  "notes": "Thank you for your business!"
}
```

**Generate Payment Link**
- Automatically creates Razorpay payment link
- Sends WhatsApp message with payment link
- Tracks payment status

### 7. Appointment Booking

**Create Booking Slots**
```bash
POST http://localhost:4000/api/bookings/slots
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "17:00",
  "duration": 30,
  "capacity": 1
}
```

**Customer Books Appointment**
```bash
POST http://localhost:4000/api/bookings
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "+919876543210",
  "customerEmail": "john@example.com",
  "bookingDate": "2025-12-05",
  "startTime": "10:00",
  "duration": 30
}
```

### 8. View Dashboard

**Get Dashboard Stats**
```bash
GET http://localhost:4000/api/dashboard/stats
Authorization: Bearer {your_jwt_token}
```

Returns:
- Total leads, new leads, converted leads
- Total invoices, paid invoices, revenue
- Total bookings, confirmed bookings
- Messages sent/received

---

## ❌ What's NOT Implemented Yet

### Critical Missing Features

1. **Frontend UI Pages** (Partially Complete)
   - ❌ Dashboard page (exists but needs to connect to API)
   - ❌ Leads management page
   - ❌ Invoice creation/list pages
   - ❌ Booking management pages
   - ❌ WhatsApp message interface
   - ❌ Settings/integrations page
   - ✅ Auth pages (signin/signup exist)

2. **Worker Service** (Structure exists, needs implementation)
   - ❌ Background job processing with BullMQ
   - ❌ Scheduled payment reminders
   - ❌ Follow-up sequence automation
   - ❌ Booking reminders
   - ❌ WhatsApp message queue

3. **WhatsApp Integration** (Partial)
   - ✅ Send message endpoint exists
   - ❌ Webhook handler for incoming messages
   - ❌ Message template management
   - ❌ Media handling (images, documents)
   - ❌ WhatsApp Business Account verification

4. **Razorpay Integration** (Partial)
   - ✅ Invoice structure ready
   - ❌ Payment link generation
   - ❌ Webhook handler for payment status
   - ❌ Payment confirmation flow

5. **Google Calendar Integration**
   - ❌ OAuth flow
   - ❌ Event creation on booking
   - ❌ Event sync
   - ❌ Availability checking

6. **Payment Reminders**
   - ❌ Automatic reminder scheduling
   - ❌ Reminder templates
   - ❌ Escalation logic (day 1, day 7, etc.)

7. **Follow-up Sequences**
   - ❌ Sequence builder UI
   - ❌ Trigger configuration
   - ❌ Automated execution

8. **Analytics & Reporting**
   - ✅ Basic stats endpoint
   - ❌ Detailed analytics
   - ❌ Charts and graphs
   - ❌ Export functionality

9. **Testing**
   - ❌ Unit tests
   - ❌ Integration tests
   - ❌ E2E tests

10. **Documentation**
    - ✅ README (basic)
    - ❌ API documentation (Swagger configured but needs details)
    - ❌ User guide
    - ❌ Deployment guide

---

## 🎯 Recommended Next Steps

### Phase 1: Make It Work (Immediate)

1. **Install Docker Desktop** → Get PostgreSQL & Redis running
2. **Run Prisma Migrations** → Set up database tables
3. **Test Backend APIs** → Use Postman/Thunder Client
4. **Build Frontend Pages** → Connect UI to backend APIs

### Phase 2: Core Features (Week 1-2)

1. **Complete Frontend Dashboard**
   - Create components for stats display
   - Connect to `/api/dashboard/stats` endpoint
   - Add charts using Recharts or Chart.js

2. **Leads Management UI**
   - List view with filtering
   - Create/edit forms
   - Status update functionality
   - Activity timeline

3. **Invoice Management UI**
   - Invoice creation form
   - Invoice list with status filters
   - Invoice preview/PDF generation
   - Payment link integration

4. **WhatsApp Webhook Handler**
   - Implement `/api/whatsapp/webhook` POST endpoint
   - Parse incoming messages
   - Store in message_logs table
   - Auto-create leads from new contacts

### Phase 3: Automation (Week 3-4)

1. **Implement Worker Service**
   - Set up BullMQ queues
   - Create job processors
   - Implement retry logic

2. **Payment Reminder System**
   - Create reminder scheduler
   - Build WhatsApp templates
   - Implement escalation logic

3. **Follow-up Sequences**
   - Build sequence execution engine
   - Create trigger system
   - Add sequence management UI

### Phase 4: Integrations (Week 5-6)

1. **Razorpay Integration**
   - Payment link generation
   - Webhook handler
   - Payment status sync

2. **Google Calendar**
   - OAuth implementation
   - Event creation on booking
   - Two-way sync

3. **WhatsApp Templates**
   - Template management
   - Variable substitution
   - Media support

### Phase 5: Polish (Week 7-8)

1. **Testing**
   - Write unit tests
   - Integration tests
   - E2E tests with Playwright

2. **Documentation**
   - Complete API docs
   - User guide
   - Video tutorials

3. **Deployment**
   - Deploy backend (Railway/Fly.io)
   - Deploy frontend (Vercel)
   - Deploy database (Supabase/Neon)
   - Set up monitoring

---

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot connect to database"**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `psql -U postgres -l`

**2. "Prisma Client not generated"**
- Run: `npm run db:generate`
- Rebuild: `cd apps/backend && npm run build`

**3. "Port already in use"**
- Backend (4000): Check if another app is using port 4000
- Frontend (3000): Check if another app is using port 3000
- Change PORT in .env if needed

**4. "Redis connection failed"**
- Ensure Redis is running
- Check REDIS_HOST and REDIS_PORT in .env
- Test: `redis-cli ping` (should return PONG)

**5. "WhatsApp API errors"**
- Verify credentials in .env
- Check Meta Developer Console for app status
- Ensure webhook is properly configured

---

## 📊 Database Management

### Useful Commands

```powershell
# Generate Prisma Client
npm run db:generate

# Create migration
npm run db:migrate

# Apply migrations (production)
cd apps\backend
npm run db:migrate:deploy

# Open Prisma Studio (Database GUI)
npm run db:studio

# Reset database (WARNING: Deletes all data)
cd apps\backend
npx prisma migrate reset
```

### Accessing PostgreSQL

```powershell
# Via Docker
docker exec -it flowforge-postgres psql -U postgres -d flowforge

# Via psql (if installed)
psql -U postgres -d flowforge

# Common queries
SELECT * FROM users;
SELECT * FROM businesses;
SELECT * FROM leads;
SELECT * FROM invoices;
```

---

## 📞 Support & Resources

### Official Documentation
- NestJS: https://docs.nestjs.com/
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp
- Razorpay: https://razorpay.com/docs/

### Project Links
- Repository: https://github.com/AkshatMishra0/FlowForge
- Issues: https://github.com/AkshatMishra0/FlowForge/issues

---

## 📝 License

MIT License - see LICENSE file

---

**Last Updated:** December 1, 2025
