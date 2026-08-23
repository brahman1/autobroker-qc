@echo off
chcp 65001 >nul
echo.
echo [AutoBroker QC] Arrêt de tous les services...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3001"') do (
    taskkill /PID %%a /F >nul 2>&1
    echo   ✅ Backend arrêté (PID %%a)
)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173"') do (
    taskkill /PID %%a /F >nul 2>&1
    echo   ✅ Frontend arrêté (PID %%a)
)
echo.
echo  Tous les services sont arrêtés.
timeout /t 2 /nobreak >nul
