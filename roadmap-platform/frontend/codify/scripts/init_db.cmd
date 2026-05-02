@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0init_db.ps1" %*
