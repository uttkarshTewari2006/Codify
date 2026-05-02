@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0bootstrap_backend_env.ps1" %*
