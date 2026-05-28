@echo off
title IYO Immo — Dev Server
cls
echo.
echo  =============================================
echo    IYO IMMO — Starting Development Servers
echo  =============================================
echo.

:: Check if database already exists
if not exist "backend\data\users.db" (
    echo  [1/3] First run - setting up database...
    cd backend
    node setup.js
    cd ..
    echo.
) else (
    echo  [1/3] Database already exists - skipping setup
)

echo  [2/3] Starting Backend API (port 5000^)...
start "IYO Backend" /min cmd /k "cd backend && node server.js"
timeout /t 2 /nobreak > nul

echo  [3/3] Starting Frontend (port 3000^)...
start "IYO Frontend" /min cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo  =============================================
echo   Website:  http://localhost:3000
echo   Admin:    http://localhost:3000/admin
echo   API:      http://localhost:5000/api
echo  ---------------------------------------------
echo   Login:    admin@iyoimmo.com
echo   Password: Admin@2026
echo  =============================================
echo.
start "" http://localhost:3000
pause
