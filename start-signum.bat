@echo off
cd /d "%~dp0"
echo Starting Signum...
start "" "http://localhost:3000"
call npm start
pause
