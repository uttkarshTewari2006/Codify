param(
    [string]$MigrationName = "init"
)

$ErrorActionPreference = "Stop"

$frontendRoot = Split-Path -Parent $PSScriptRoot
Set-Location $frontendRoot

if (-not $env:DATABASE_URL) {
    throw "DATABASE_URL must be set before running Prisma migrations."
}

Write-Host "Running Prisma migrate dev against $env:DATABASE_URL"
cmd /c "npx prisma migrate dev --name $MigrationName"

Write-Host "Generating Prisma client"
cmd /c "npx prisma generate"
