# Portfolio Startup Script for Module Federation
# This script builds and starts all micro-frontends in the correct order

Write-Host "🚀 Starting Portfolio with Module Federation..." -ForegroundColor Green

# Step 1: Build remote micro-frontends
Write-Host "📦 Building remote micro-frontends..." -ForegroundColor Yellow
pnpm build:remotes

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Remote builds completed!" -ForegroundColor Green

# Step 2: Start remotes in preview mode (background)
Write-Host "🔄 Starting remote services in preview mode..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; pnpm preview:remotes" -WindowStyle Minimized

# Wait for services to start
Write-Host "⏳ Waiting for remote services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 3: Start portfolio-home
Write-Host "🏠 Starting portfolio-home..." -ForegroundColor Yellow
cd packages/portfolio-home
pnpm start

Write-Host "🎉 Portfolio is ready!" -ForegroundColor Green
Write-Host "📍 Services running on:" -ForegroundColor Cyan
Write-Host "  - Portfolio Home: http://localhost:5005" -ForegroundColor White
Write-Host "  - Flash Card App: http://localhost:5001" -ForegroundColor White
Write-Host "  - CV Generator: http://localhost:5002" -ForegroundColor White
Write-Host "  - Tarot Reader: http://localhost:5003" -ForegroundColor White