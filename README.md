# Talent MVP (Monorepo)
MVP: login por roles, listado con filtros, 1 gráfica, export CSV.

## Requisitos
- Windows 10/11
- Python 3.11+
- Node.js 20+

## Estructura
/api (FastAPI), /web (React+TS), /data (employees.csv), /docs, /scripts

## Setup backend
cd api
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt  # (o usar los comandos del README)
uvicorn app.main:app --reload

## Setup frontend
cd web
npm i
npm run dev

## Scripts
.\scripts\dev.ps1   # levanta API y Web

## Credenciales demo
- hr@example.com / hr123
- manager@example.com / mgr123
- analyst@example.com / ana123

# Talent Analytics – MVP (monorepo)

## Requisitos
- Windows 10/11 + PowerShell
- Node 18+ / npm 10+
- Python 3.11+
- Git

## Primer arranque (Windows)
```powershell
# desde la raíz
.\scripts\setup.ps1
