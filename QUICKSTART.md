# 🚀 FlowForge - Quick Start Guide

## ✅ Current Status

Your FlowForge application is **ready to run**:

- ✅ **Code**: Compilation errors fixed
- ✅ **Dependencies**: Installed
- ✅ **Prisma Client**: Generated
- ❌ **Database**: PostgreSQL needed
- ❌ **Cache**: Redis needed

## 📋 What You Need

### Option 1: Install Services Locally (Recommended for Windows)

#### PostgreSQL
1. Download: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember your password
4. PostgreSQL will run on `localhost:5432`

#### Redis
1. Download: https://github.com/tporadowski/redis/releases
2. Install and run as Windows service
3. Redis will run on `localhost:6379`

### Option 2: Use Docker (Easier)

Install Docker Desktop: https://www.docker.com/products/docker-desktop

Then run:
```bash
docker-compose up -d
```

## 🎯 After Installing PostgreSQL & Redis

1. **Run Database Migrations:**
```bash
cd apps/backend
npm run db:migrate
```

2. **Start All Services:**
```bash
cd ../..
npm run dev
```

## 🌐 Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **API Docs (Swagger)**: http://localhost:4000/api

## 🔑 Configure API Keys

Edit these files with your real API keys:

### `apps/backend/.env`
```env
# Get from: https://business.facebook.com/
WHATSAPP_PHONE_NUMBER_ID="your-id"
WHATSAPP_ACCESS_TOKEN="your-token"

# Get from: https://razorpay.com/
RAZORPAY_KEY_ID="your-key"
RAZORPAY_KEY_SECRET="your-secret"

# Get from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-secret"
```

## 📱 Test the Application

1. **Sign Up**: http://localhost:3000/auth/signup
2. **Sign In**: http://localhost:3000/auth/signin
3. **Dashboard**: http://localhost:3000/dashboard

## 🐛 Troubleshooting

### "Can't reach database server"
- Make sure PostgreSQL is running
- Check connection: `psql -h localhost -p 5432 -U postgres`

### "Worker Redis error"
- Make sure Redis is running
- Check connection: `redis-cli ping` (should return PONG)

### Port Already in Use
- Backend using 4000: Change `PORT` in `apps/backend/.env`
- Frontend using 3000: Change in `apps/web/package.json`

## 📚 Documentation

- **Installation Guide**: [INSTALLATION.md](./INSTALLATION.md)
- **API Documentation**: [API.md](./API.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)

## 🎉 What's Working Right Now

Even without the backend, you can:
- ✅ View the landing page
- ✅ See the UI design
- ✅ Navigate between pages
- ✅ Test responsive design

## 🚀 Next Steps

1. Install PostgreSQL and Redis
2. Run migrations
3. Configure API keys
4. Start building your business automation!

---

**Need help?** Open an issue on GitHub: https://github.com/AkshatMishra0/FlowForge
