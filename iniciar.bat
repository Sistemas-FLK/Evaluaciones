@echo off
title QUIMICORP TALENT - Servidor de Evaluacion
cd /d "%~dp0\server"
echo ====================================================
echo   INICIANDO QUIMICORP TALENT EN PUERTO 1234
echo   Abriendo navegador en http://localhost:1234...
echo ====================================================
timeout /t 2 /nobreak >nul
start http://localhost:1234
npm start
pause
