# Talent Allocation Analytics Platform

A full-stack web application for workforce analytics, employee management, and talent allocation.

This project provides role-based authentication, employee management workflows, workforce analytics dashboards, talent allocation search, bench tracking, and CSV export functionality. It is organized as a monorepo with a React + TypeScript frontend and a FastAPI backend.

> **Summary**: role-based login (HR, Manager, Analyst), employee management, workforce analytics dashboards, talent allocation search, bench history tracking, CSV export, and sample data available in `/data`.

---

## Contents

- [Key Features](#key-features)
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
- [Local Demo Credentials](#demo-roles-and-credentials)
- [Useful Endpoints](#useful-endpoints)
- [Project Scope](#project-scope)

---

## Key Features

- Role-based authentication with JWT
- Employee directory with dynamic filters
- Employee record creation and filtering workflows
- Workforce analytics dashboards, reporting endpoints, and export flows
- Talent allocation search based on profile criteria
- Bench history tracking
- CSV export for operational reporting
- Documented API with Swagger

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
/docs      Additional documentation, diagrams, architecture notes, and supporting material
/scripts   PowerShell scripts for setup and quick local startup on Windows
```

---

## Core Modules

- **Authentication**: JWT-based login and role-aware access control
- **Employees**: employee listing, filtering, and record creation
- **Reports**: workforce distributions, attrition-related metrics, and exports
- **Assignments**: profile search for talent allocation based on selected criteria
- **Bench**: bench history registration and lifecycle tracking

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
- Purpose: synthetic workforce dataset for local testing and demo flows

---

## Local Demo Credentials

To quickly test the role-based flow:

- **HR** — `hr@example.com` / `hr123`
- **Manager** — `manager@example.com` / `mgr123`
- **Analyst** — `analyst@example.com` / `ana123`

> Update these credentials according to your local seed data or user creation flow.

---

## Useful Endpoints

- **API Docs**: <http://localhost:8000/docs>
- **ReDoc**: <http://localhost:8000/redoc>

Reference endpoints:

### Authentication
- `POST /auth/login` — obtain a JWT token

### Employees
- `GET /employees` — get employee list with filters
- `POST /employees` — create a new employee record

### Reports
- `GET /reports/distribution` — get employee distributions by attribute
- `GET /reports/leave_probability` — get attrition-related metrics
- `GET /reports/correlation` — get correlation insights
- `GET /reports/export_preset` — export predefined reports

### Assignments
- `GET /assignments/search` — search employee profiles for allocation

### Bench
- `GET /bench/employees/{employee_id}/events` — get bench history by employee
- `POST /bench/employees/{employee_id}/events` — create a bench event
- `PATCH /bench/events/{event_id}/end` — close a bench event

---

## Project Scope

This MVP focuses on a workforce analytics and talent operations workflow:

- role-based access and protected views
- employee data exploration and management
- workforce analytics and reporting
- talent allocation search by profile criteria
- bench history tracking
- CSV export for operational reporting
- clean separation between frontend and backend in a monorepo structure

## Notes

- SQLite is used for local development.
- Sample data is synthetic and intended for testing and demo flows.
- Credentials and seeded records may vary depending on local setup.
- The data layer can be migrated to PostgreSQL for a more production-oriented setup.
