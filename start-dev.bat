@echo off
title Iniciador NextJS/NestJS (Separado)

:: ----------------------------------------------------------------------
:: 1. INICIAR BACKEND (NestJS) en una nueva ventana de terminal
:: ----------------------------------------------------------------------
echo.
echo ======================================================
echo  Iniciando NestJS Backend en una terminal separada...
echo ======================================================
echo.
:: El comando "start" abre un nuevo cmd.exe. 
:: El "/d" cambia al directorio especificado.
:: El "cmd /k" ejecuta el comando y MANTIENE la ventana abierta (/k).
start "NestJS Backend" /d "backend" cmd /k "npm run start:dev"


:: ----------------------------------------------------------------------
:: 2. INICIAR FRONTEND (Next.js) en una nueva ventana de terminal
:: ----------------------------------------------------------------------
echo.
echo ======================================================
echo  Iniciando Next.js Frontend en una terminal separada...
echo ======================================================
echo.
:: Repetimos la lógica para el frontend.
start "NextJS Frontend" /d "frontend" cmd /k "npm run dev"


:: ----------------------------------------------------------------------
:: 3. FINALIZAR SCRIPT
:: ----------------------------------------------------------------------
echo.
echo ======================================================
echo  Inicio completo. Revise las nuevas ventanas.
echo ======================================================
echo.
pause
exit