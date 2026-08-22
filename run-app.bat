@echo off
echo ===================================================
echo   Starting WhatsApp Clone Full-Stack Application
echo ===================================================

set JAVA_HOME=F:\JDK
set MAVEN_CMD=C:\Users\vishe\.m2\wrapper\dists\apache-maven-3.9.15-bin\4rlcemksed9vjmkvgss0jpc4po\apache-maven-3.9.15\bin\mvn.cmd

echo [1/2] Launching Spring Boot Backend on http://localhost:8080...
start "ChatApp - Spring Boot Backend" cmd /k "cd /d %~dp0backend && set JAVA_HOME=F:\JDK && %MAVEN_CMD% spring-boot:run"

echo [2/2] Launching Vite React Frontend on http://localhost:5173...
start "ChatApp - React Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   Application is launching!
echo   Frontend URL: http://localhost:5173
echo   Backend API:  http://localhost:8080
echo   H2 Console:   http://localhost:8080/h2-console
echo ===================================================
pause
