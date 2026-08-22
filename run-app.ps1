# WhatsApp Clone Launch Script
$env:JAVA_HOME = "F:\JDK"
$mavenCmd = "C:\Users\vishe\.m2\wrapper\dists\apache-maven-3.9.15-bin\4rlcemksed9vjmkvgss0jpc4po\apache-maven-3.9.15\bin\mvn.cmd"

Write-Host "===================================================" -ForegroundColor Green
Write-Host "  Starting WhatsApp Clone Full-Stack Application   " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`n[1/2] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; `$env:JAVA_HOME = 'F:\JDK'; & '$mavenCmd' spring-boot:run"

Write-Host "[2/2] Starting React Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "  App Launched Successfully!" -ForegroundColor Green
Write-Host "  Frontend URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend API:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "  H2 DB Console: http://localhost:8080/h2-console" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Green
