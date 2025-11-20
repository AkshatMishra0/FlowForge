# FlowForge - Git Setup Script
# Run this to initialize the repository and push to GitHub

echo "🚀 Initializing FlowForge Git Repository..."

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: FlowForge SaaS Platform

- Complete monorepo structure with Turbo
- NestJS backend with all modules (Auth, WhatsApp, Invoice, Booking, Lead, Dashboard)
- Next.js frontend with landing page and dashboard
- BullMQ workers for background jobs
- Prisma database schema with all models
- Full API documentation with Swagger
- WhatsApp Cloud API integration
- Razorpay payment integration
- Google Calendar sync structure
- Comprehensive installation guide"

# Create development branch
git branch -M main

# Add remote origin
git remote add origin https://github.com/AkshatMishra0/FlowForge.git

# Push to GitHub
git push -u origin main

echo "✅ Repository initialized and pushed to GitHub!"
echo "🌐 View at: https://github.com/AkshatMishra0/FlowForge"
