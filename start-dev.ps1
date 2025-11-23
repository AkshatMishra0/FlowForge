# FlowForge Development Startup Script

Write-Host "🚀 Starting FlowForge Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL and Redis are running
Write-Host "⚠️  Prerequisites Check:" -ForegroundColor Yellow
Write-Host "1. PostgreSQL must be running on localhost:5432" -ForegroundColor White
Write-Host "2. Redis must be running on localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "If you don't have these installed:" -ForegroundColor Yellow
Write-Host "- Install PostgreSQL: https://www.postgresql.org/download/" -ForegroundColor White
Write-Host "- Install Redis: https://redis.io/download/" -ForegroundColor White
Write-Host "- Or use Docker: docker-compose up -d" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Continue? (Y/n)" 
if ($continue -eq "n") {
    exit
}

Write-Host ""
Write-Host "📦 Running database migrations..." -ForegroundColor Cyan
Set-Location apps/backend
npm run db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database migration failed! Check if PostgreSQL is running." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Starting all services..." -ForegroundColor Green
Set-Location ../..

# Start all services in development mode
npm run dev
