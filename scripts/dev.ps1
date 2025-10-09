# scripts/dev.ps1  (PowerShell en Windows)

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force | Out-Null

$root   = Split-Path -Parent $PSScriptRoot
$apiDir = Join-Path $root "api"
$webDir = Join-Path $root "web"

Write-Host "root  :" $root
Write-Host "apiDir:" $apiDir
Write-Host "webDir:" $webDir

if (!(Test-Path $apiDir)) { Write-Error "No existe: $apiDir"; exit 1 }
if (!(Test-Path $webDir)) { Write-Error "No existe: $webDir"; exit 1 }

$apiCmd = @'
if (!(Test-Path .\.venv)) { py -m venv .venv }
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000   # <— antes decía: uvicorn main:app
'@

Start-Process powershell -WorkingDirectory $apiDir -ArgumentList '-NoExit','-Command', $apiCmd

$webCmd = @'
npm run dev
'@

Start-Process powershell -WorkingDirectory $webDir -ArgumentList '-NoExit','-Command', $webCmd
