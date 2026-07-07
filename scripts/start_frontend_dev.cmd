@echo off
cd /d "%~dp0..\frontend"
if not exist ..\logs mkdir ..\logs
npm.cmd run dev -- --host 127.0.0.1 --port 5173 > ..\logs\frontend-dev.log 2> ..\logs\frontend-dev.err.log
