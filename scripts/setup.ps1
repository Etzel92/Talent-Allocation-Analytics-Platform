Write-Host "==> Setup FRONTEND"
cd $PSScriptRoot\..\web
if (!(Test-Path node_modules)) { npm install }

Write-Host "==> Setup BACKEND (venv)"
cd $PSScriptRoot\..\api
if (!(Test-Path .venv)) { python -m venv .venv }
& .\.venv\Scripts\pip install --upgrade pip
& .\.venv\Scripts\pip install -r requirements.txt

Write-Host "==> Install pre-commit hook"
& .\.venv\Scripts\pip install pre-commit
pre-commit install
Write-Host "DONE."
