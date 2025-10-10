# KPMG HR Insights — Talent Analytics (Monorepo)

_MVP funcional para análisis de talento y asignación de perfiles._

> **Resumen del MVP**: login por roles (HR, Manager, Analyst), listado de empleados con filtros, 1–2 gráficas básicas y exportación CSV. Dataset de ejemplo en `/data`. Credenciales de demo más abajo.

---

## Contenidos
- [Arquitectura y stack](#arquitectura-y-stack)
- [Estructura del monorepo](#estructura-del-monorepo)
- [Requisitos](#requisitos)
- [Primer arranque (Windows)](#primer-arranque-windows)
- [Backend (FastAPI)](#backend-fastapi)
  - [Variables de entorno](#variables-de-entorno)
  - [Instalación y arranque](#instalación-y-arranque)
  - [Migrations (Alembic)](#migrations-alembic)
  - [Pruebas, lint y formato (Python)](#pruebas-lint-y-formato-python)
- [Frontend (React + TypeScript + Vite)](#frontend-react--typescript--vite)
  - [Instalación y arranque](#instalación-y-arranque-1)
  - [Scripts de NPM (tests, lint, formato)](#scripts-de-npm-tests-lint-formato)
- [Scripts de PowerShell (raíz \scripts)](#scripts-de-powershell-raíz-scripts)
- [Datos de ejemplo](#datos-de-ejemplo)
- [Roles y credenciales demo](#roles-y-credenciales-demo)
- [Endpoints útiles](#endpoints-útiles)
- [Checklist rápido](#checklist-rápido)

---

## Arquitectura y stack

- **Frontend**: React 18 + TypeScript + Vite, UI con MUI, gráficos con Recharts, datos con React Query.
- **Backend**: FastAPI (Python 3.11), SQLAlchemy, Alembic, autenticación JWT, autorización por **roles**.
- **DB (dev)**: SQLite por simplicidad (puede cambiarse a PostgreSQL en despliegue).
- **Empaquetado tooling**:
  - **Frontend**: ESLint + Prettier + Vitest + React Testing Library.
  - **Backend**: pytest + ruff + black + (opcional) mypy.
- **Dev UX**: scripts en `./scripts/*.ps1` para instalar y levantar todo rápidamente en Windows.

---

## Estructura del monorepo

```
/api       # FastAPI + SQLAlchemy + Alembic (JWT, roles)
/web       # React + TypeScript + Vite + MUI + React Query + Recharts
/data      # CSV de apoyo (p. ej., employees.csv)
/docs      # documentación adicional (diagramas, decisiones, etc.)
/scripts   # scripts .ps1 para setup/arranque rápido en Windows
```

---

## Requisitos

- Windows 10/11 **con PowerShell**
- **Python 3.11+**
- **Node.js 18/20+** y **npm 10+**
- **Git**

---

## Primer arranque (Windows)

Desde la **raíz** del repo:

```powershell
# instala dependencias de /api y /web, crea y activa venv
.\scripts\setup.ps1

# arranca servicios en terminales separadas
.\scripts
un_api.ps1
.\scripts
un_web.ps1

# o, modo todo-en-uno (si está disponible en tu entorno)
.\scripts\dev.ps1
```

---

## Backend (FastAPI), instalación y arranque por separado

```powershell
cd api
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

### Migrations (Alembic)

```powershell
cd api
.\.venv\Scripts\Activate.ps1

# crear tablas (si hay revisiones)
alembic upgrade head

# crear una nueva migración (cuando cambie el modelo)
alembic revision -m "feat: add <tabla/campo>"
alembic upgrade head
```

### Pruebas, lint y formato (Python)

Instalar herramientas (si no existen todavía):

```powershell
cd api
.\.venv\Scripts\Activate.ps1
pip install pytest ruff black pre-commit
pre-commit install
```

Comandos recomendados:

```powershell
# pruebas
pytest -q

# lint (estático) y autoformato
ruff check .
ruff format .   # (o) black .

# hooks locales (antes de hacer commit)
pre-commit run --all-files
```

---

## Frontend (React + TypeScript + Vite), instalación y arranque por separdo

```powershell
cd web
npm ci   # o: npm i
npm run dev  # http://localhost:5173
```

### Scripts de NPM (tests, lint, formato)

Agrega estos scripts al `package.json` de `/web` si aún no existen:

Instalar (si falta):

```powershell
cd web
npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm i -D prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks
npm i -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event jsdom
```

---

## Datos de ejemplo

- Archivo: `/data/employees.csv` (dataset sintético para pruebas).
---

## Roles y credenciales demo

Para evaluar rápidamente el flujo por **roles**:

- **HR** — `hr@example.com` / ``  
- **Manager** — `manager@example.com` / `mgr123`  
- **Analyst** — `analyst@example.com` / `ana123`
---

## Endpoints útiles

- **Docs de API**: <http://localhost:8000/docs> (Swagger UI – FastAPI)
- **ReDoc**: <http://localhost:8000/redoc>

_Algunos endpoints de referencia (pueden variar según tu implementación):_

- `POST /auth/login` – obtiene JWT
- `GET /employees` – listado + filtros (ciudad, edad, género, educación, etc.)
- `GET /reports/distribution?by=gender` – distribución básica por atributo
- `GET /export/employees.csv` – exportación CSV

---