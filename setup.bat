@echo off
echo ========================================
echo    SISTEMA DE NOTAS - SETUP AUTOMATICO
echo ========================================
echo.

:: Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js no está instalado
    echo Descarga Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar si PostgreSQL está instalado
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: PostgreSQL no está instalado
    echo Descarga PostgreSQL desde: https://www.postgresql.org/download/
    pause
    exit /b 1
)

echo ✅ Requisitos verificados correctamente
echo.

:: Instalar dependencias del backend
echo 📦 Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: Falló la instalación de dependencias del backend
    pause
    exit /b 1
)

:: Verificar si existe .env
if not exist .env (
    echo ⚠️  Archivo .env no encontrado
    echo 📝 Copiando .env.example a .env...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANTE: Edita el archivo backend/.env con tus configuraciones
    echo    - Configura DATABASE_URL con tus credenciales de PostgreSQL
    echo    - Cambia JWT_SECRET por una clave segura
    echo.
    pause
)

:: Generar cliente Prisma
echo 🔧 Generando cliente Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ ERROR: Falló la generación del cliente Prisma
    pause
    exit /b 1
)

:: Ejecutar migraciones
echo 🗄️  Ejecutando migraciones de base de datos...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo ❌ ERROR: Fallaron las migraciones de base de datos
    echo Verifica que PostgreSQL esté ejecutándose y las credenciales en .env sean correctas
    pause
    exit /b 1
)

:: Volver a la raíz
cd ..

:: Instalar dependencias del frontend
echo 📦 Instalando dependencias del frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: Falló la instalación de dependencias del frontend
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo ✅ INSTALACIÓN COMPLETADA EXITOSAMENTE
echo ========================================
echo.
echo Para ejecutar el proyecto:
echo.
echo 1. Backend (Terminal 1):
echo    cd backend
echo    npm run start:dev
echo.
echo 2. Frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo El sistema estará disponible en:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:3001
echo.
pause
