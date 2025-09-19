@echo off
echo ========================================
echo    SISTEMA DE NOTAS - INICIO RAPIDO
echo ========================================
echo.

:: Verificar que las dependencias estén instaladas
if not exist "backend\node_modules" (
    echo ❌ ERROR: Dependencias del backend no instaladas
    echo Ejecuta primero: setup.bat
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo ❌ ERROR: Dependencias del frontend no instaladas
    echo Ejecuta primero: setup.bat
    pause
    exit /b 1
)

:: Verificar que existe .env
if not exist "backend\.env" (
    echo ❌ ERROR: Archivo .env no encontrado
    echo Copia backend\.env.example a backend\.env y configúralo
    pause
    exit /b 1
)

echo 🚀 Iniciando Sistema de Notas...
echo.
echo ⚠️  Se abrirán 2 ventanas de terminal:
echo    - Terminal 1: Backend (Puerto 3001)
echo    - Terminal 2: Frontend (Puerto 3000)
echo.
echo ✅ Para detener el sistema: Presiona Ctrl+C en ambas terminales
echo.

:: Iniciar backend en nueva ventana
start "Backend - Sistema de Notas" cmd /k "cd backend && npm run start:dev"

:: Esperar un momento para que el backend inicie
timeout /t 3 /nobreak >nul

:: Iniciar frontend en nueva ventana
start "Frontend - Sistema de Notas" cmd /k "cd frontend && npm run dev"

:: Esperar un momento más
timeout /t 5 /nobreak >nul

:: Abrir navegador
echo 🌐 Abriendo navegador...
start http://localhost:3000

echo.
echo ========================================
echo ✅ SISTEMA INICIADO CORRECTAMENTE
echo ========================================
echo.
echo URLs disponibles:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:3001
echo - Prisma Studio: npx prisma studio (desde backend/)
echo.
echo Para detener: Cierra las ventanas de terminal o presiona Ctrl+C
echo.
pause
