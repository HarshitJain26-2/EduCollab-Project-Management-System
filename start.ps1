Write-Host "🚀 Starting EduCollab - Project Management System" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend API on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\jainh\Desktop\New folder\backend'; node src/server.js" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\jainh\Desktop\New folder\frontend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Both servers started!" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: Make sure MongoDB is running on localhost:27017" -ForegroundColor DarkYellow
Write-Host "      Download: https://www.mongodb.com/try/download/community" -ForegroundColor DarkYellow
