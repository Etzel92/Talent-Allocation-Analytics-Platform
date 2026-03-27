# Talent Allocation Analytics Platform

A full-stack web application for workforce analytics and talent allocation.

This project includes role-based authentication, an employee directory with filters, basic analytics dashboards, and CSV export functionality. It is built as a monorepo with a React + TypeScript frontend and a FastAPI backend.

> **MVP summary**: role-based login (HR, Manager, Analyst), employee listing with filters, basic charts, CSV export, and sample data available in `/data`.

---

## Contents

- [Architecture and Stack](#architecture-and-stack)
- [Monorepo Structure](#monorepo-structure)
- [Requirements](#requirements)
- [Quick Start (Windows)](#quick-start-windows)
- [Backend (FastAPI)](#backend-fastapi)
  - [Installation and Run](#installation-and-run)
  - [Migrations (Alembic)](#migrations-alembic)
  - [Testing, Linting, and Formatting (Python)](#testing-linting-and-formatting-python)
- [Frontend (React + TypeScript + Vite)](#frontend-react--typescript--vite)
  - [Installation and Run](#installation-and-run-1)
  - [NPM Tooling](#npm-tooling)
- [Sample Data](#sample-data)
- [Demo Roles and Credentials](#demo-roles-and-credentials)
- [Useful Endpoints](#useful-endpoints)
- [Project Scope](#project-scope)

---

## Architecture and Stack

- **Frontend**: React 18, TypeScript, Vite, Material UI, Recharts, React Query
- **Backend**: FastAPI, Python 3.11, SQLAlchemy, Alembic, JWT authentication, role-based authorization
- **Database (development)**: SQLite for simplicity, with the option to migrate to PostgreSQL later
- **Frontend tooling**: ESLint, Prettier, Vitest, React Testing Library
- **Backend tooling**: pytest, Ruff, Black, optional mypy
- **Developer experience**: PowerShell scripts in `./scripts/*.ps1` to simplify setup and local execution on Windows

---

## Monorepo Structure

```text
/api       FastAPI backend with SQLAlchemy, Alembic, JWT auth, and role handling
/web       React + TypeScript + Vite frontend with MUI, React Query, and Recharts
/data      Supporting CSV data (for example, employees.csv)
/docs      Additional documentation, diagrams, and technical notes
/scripts   PowerShell scripts for setup and quick local startup on Windows
```

---

## Requirements

- Windows 10/11 with PowerShell
- Python 3.11+
- Node.js 18+ or 20+
- npm 10+
- Git

---

## Quick Start (Windows)

From the **root** of the repository:

```powershell
# install dependencies for /api and /web, create and activate the virtual environment
.\scripts\setup.ps1

# start services in separate terminals
.\scripts\run_api.ps1
.\scripts\run_web.ps1

# optional all-in-one mode
.\scripts\dev.ps1
```

---

## Backend (FastAPI)

### Installation and Run

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

# apply migrations
alembic upgrade head

# create a new migration when the data model changes
alembic revision -m "feat: add <table/field>"
alembic upgrade head
```

### Testing, Linting, and Formatting (Python)

Install the tools if needed:

```powershell
cd api
.\.venv\Scripts\Activate.ps1
pip install pytest ruff black pre-commit
pre-commit install
```

Recommended commands:

```powershell
# run tests
pytest -q

# lint and format
ruff check .
ruff format .
# or
black .

# run local git hooks before commit
pre-commit run --all-files
```

---

## Frontend (React + TypeScript + Vite)

### Installation and Run

```powershell
cd web
npm ci
npm run dev
```

The frontend will usually be available at:

```text
http://localhost:5173
```

### NPM Tooling

If any of these tools are missing, install them with:

```powershell
cd web
npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm i -D prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks
npm i -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event jsdom
```

---

## Sample Data

- File: `/data/employees.csv`
- Purpose: synthetic dataset for local testing and demo flows

---

## Demo Roles and Credentials

To quickly test the role-based flow:

- **HR** — `hr@example.com`
- **Manager** — `manager@example.com` / `mgr123`
- **Analyst** — `analyst@example.com` / `ana123`

> Update these credentials according to your local seed data or user creation flow.

---

## Useful Endpoints

- **API Docs**: <http://localhost:8000/docs>
- **ReDoc**: <http://localhost:8000/redoc>

Reference endpoints:

- `POST /auth/login` — obtain a JWT token
- `GET /employees` — get employee list with filters
- `GET /reports/distribution?by=gender` — get a basic distribution by attribute
- `GET /export/employees.csv` — export employee data as CSV

---

## Project Scope

This MVP focuses on a simple talent analytics workflow:

- role-based access
- employee data exploration
- basic workforce visualization
- CSV export for reporting
- clean separation between frontend and backend in a monorepo structure

It is intended as a practical portfolio project that demonstrates full-stack development, API design, authentication, reporting features, and dashboard-oriented UI work.
