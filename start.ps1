Write-Host "🚀 Starting EduCollab - Project Management System" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend API on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\jainh\Desktop\New folder\backend'; node src/server.js" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend (Next.js) on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\jainh\Desktop\New folder\frontend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ All systems started!" -ForegroundColor Green
Write-Host "   Frontend (UI):  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend (API): http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: Make sure Database is running." -ForegroundColor DarkYellow
