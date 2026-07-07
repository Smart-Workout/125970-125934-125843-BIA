@echo off
cd /d "%~dp0.."
if not exist logs mkdir logs
".venv\Scripts\python.exe" -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 > logs\backend-dev.log 2> logs\backend-dev.err.log
