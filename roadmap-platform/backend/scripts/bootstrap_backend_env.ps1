param(
    [string]$VenvPath = ".venv",
    [string]$PythonPath = "",
    [switch]$ForceRecreate
)

$ErrorActionPreference = "Stop"

$backendRoot = Split-Path -Parent $PSScriptRoot
$venvRoot = Join-Path $backendRoot $VenvPath
$venvConfig = Join-Path $venvRoot "pyvenv.cfg"
$venvPython = Join-Path $venvRoot "Scripts\\python.exe"

function Test-PythonCandidate {
    param([string]$Candidate)

    if (-not $Candidate) {
        return $false
    }

    if ($Candidate -like "*Microsoft\\WindowsApps*") {
        return $false
    }

    if (-not (Test-Path $Candidate)) {
        return $false
    }

    try {
        & $Candidate -c "import venv, sys; print(sys.executable)" | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Get-UsablePython {
    param([string]$PreferredPython)

    $candidates = New-Object System.Collections.Generic.List[string]

    if ($PreferredPython) {
        $candidates.Add($PreferredPython)
    }

    if ($env:CODIFY_PYTHON) {
        $candidates.Add($env:CODIFY_PYTHON)
    }

    foreach ($commandName in @("python", "python3")) {
        try {
            $command = Get-Command $commandName -ErrorAction Stop
            if ($command.Source) {
                $candidates.Add($command.Source)
            }
        } catch {
        }
    }

    $knownPaths = @(
        "C:\\Program Files\\Python313\\python.exe",
        "C:\\Program Files\\Python312\\python.exe",
        "C:\\Program Files\\Python311\\python.exe",
        "C:\\Users\\$env:USERNAME\\AppData\\Local\\Programs\\Python\\Python313\\python.exe",
        "C:\\Users\\$env:USERNAME\\AppData\\Local\\Programs\\Python\\Python312\\python.exe",
        "C:\\Users\\$env:USERNAME\\AppData\\Local\\Programs\\Python\\Python311\\python.exe",
        "C:\\Program Files\\Blender Foundation\\Blender 5.1\\5.1\\python\\bin\\python.exe",
        "C:\\Program Files\\PostgreSQL\\17\\pgAdmin 4\\python\\python.exe",
        "C:\\Program Files\\PostgreSQL\\15\\pgAdmin 4\\python\\python.exe"
    )

    foreach ($path in $knownPaths) {
        $candidates.Add($path)
    }

    foreach ($candidate in ($candidates | Select-Object -Unique)) {
        if (Test-PythonCandidate -Candidate $candidate) {
            return $candidate
        }
    }

    throw "No usable Python interpreter with the 'venv' module was found. Install Python 3.11+ or set CODIFY_PYTHON."
}

function Test-ExistingVenv {
    if (-not (Test-Path $venvPython)) {
        return $false
    }

    try {
        & $venvPython --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

if (Test-ExistingVenv) {
    Write-Host "Backend virtualenv is already usable at $venvRoot"
} else {
    if ((Test-Path $venvRoot) -and $ForceRecreate) {
        Remove-Item -LiteralPath $venvRoot -Recurse -Force
    }

    if (Test-Path $venvRoot) {
        throw "Existing virtualenv at '$venvRoot' is not usable. Re-run with -ForceRecreate to rebuild it."
    }

    $python = Get-UsablePython -PreferredPython $PythonPath

    Write-Host "Creating backend virtualenv with $python"
    & $python -m venv $venvRoot
}

Write-Host "Installing backend runtime and dev dependencies"
& $venvPython -m pip install -r (Join-Path $backendRoot "requirements-dev.txt")

Write-Host ""
Write-Host "Backend environment ready."
Write-Host "Activate with: $venvRoot\\Scripts\\activate"
Write-Host "Run tests with: $venvPython -m pytest tests -q"
