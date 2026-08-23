@echo off
chcp 65001 > nul
echo ========================================
echo Lancement de AutoBroker QC (Base de donnees PostgreSQL)
echo ========================================

echo 1. Fermeture des anciens processus (Ports 3001 et 5173)...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| find "3001" ^| find "LISTENING"') DO taskkill /F /PID %%a >nul 2>&1
FOR /F "tokens=5" %%a IN ('netstat -aon ^| find "5173" ^| find "LISTENING"') DO taskkill /F /PID %%a >nul 2>&1

echo 2. Verification de PostgreSQL et application des migrations...
cd apps\backend
call npx prisma migrate deploy --schema prisma\schema.prisma
if errorlevel 1 (
  echo.
  echo PostgreSQL est indisponible ou la configuration est incorrecte.
  echo Demarrez Docker Desktop puis verifiez DATABASE_URL dans apps\backend\.env ^(port local attendu : 5433^).
  pause
  exit /b 1
)

echo 3. Demarrage du Backend (NestJS)...
start "Backend AutoBroker" cmd /c "npm run dev || pause"
cd ..\..

echo 4. Demarrage du Frontend (Vite)...
cd apps\frontend
start "Frontend AutoBroker" cmd /c "npm run dev || pause"
cd ..\..

echo.
echo ========================================
echo Tout est lance !
echo Frontend : http://localhost:5173
echo Backend API : http://localhost:3001/api/docs
echo ========================================
