<div align="center">

# 🔗 URL Shortener

### Create, manage, and track short links with a FastAPI backend, PostgreSQL storage, and a React dashboard.

<p>
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.11+" />
  <img src="https://img.shields.io/badge/FastAPI-0.135.3-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI 0.135.3" />
  <img src="https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Alembic-Migrations-444444?style=flat-square" alt="Alembic Migrations" />
  <img src="https://img.shields.io/badge/License-MIT-97CA00?style=flat-square" alt="MIT License" />
</p>

</div>

---

## 📖 Overview

URL Shortener is a full-stack application for generating compact, shareable links and managing them from a clean web interface.

- Create short URLs from long destination links
- Store and manage redirect records in PostgreSQL
- Handle database schema changes with Alembic migrations
- View, refresh, and delete short links from a React dashboard
- Redirect users through unique short codes with expiry-aware validation

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Alembic, Uvicorn, python-dotenv
- Frontend: React, TypeScript, Vite, Tailwind CSS, Radix UI
- Database: PostgreSQL
- Tooling: npm, pip, virtualenv

## Sample Screens

<p align="center">
  <img src="react-ui/src/assets/sample_1.png" alt="URL Shortener dashboard overview" width="48%" />
  <img src="react-ui/src/assets/sample_2.png" alt="URL Shortener links table view" width="48%" />
</p>

## Prerequisites

Install these before starting the project:

- Python 3.11+
- Node.js 20+
- npm 10+
- PostgreSQL 14+

Local development in this repository is currently aligned with:

- Python 3.11.9
- Node.js 24.12.0
- npm 11.6.2
- PostgreSQL 18.3

## Environment Variables

### Backend (`.env`)

Copy the example file:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by FastAPI and Alembic | `postgresql://postgres:postgres@localhost:5432/url_shortener` |

### Frontend (`react-ui/.env`)

Copy the example file:

```bash
cp react-ui/.env.example react-ui/.env
```

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Base URL for the FastAPI server used by the React app | `http://localhost:8088` |

If you run FastAPI on a different port or host, update `VITE_API_BASE_URL` to match it.

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Set up the FastAPI backend

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install backend dependencies:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Configure backend environment variables:

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL connection string.

### 3. Create the PostgreSQL database

Create the database referenced by `DATABASE_URL`.

Example:

```bash
createdb url_shortener
```

### 4. Run database migrations

Alembic reads the same root `.env` file as the backend.

Apply all migrations:

```bash
alembic upgrade head
```

Useful Alembic commands:

```bash
alembic revision --autogenerate -m "describe your change"
alembic downgrade -1
```

### 5. Start FastAPI

Run the API server from the project root:

```bash
uvicorn app.main:app --reload --host localhost --port 8088
```

Backend endpoints will be available at:

- API base URL: `http://localhost:8088/`
- Swagger docs: `http://localhost:8088/docs`

### 6. Set up the React frontend

Open a new terminal and move into the frontend project:

```bash
cd react-ui
```

Install frontend dependencies:

```bash
npm install
```

Configure frontend environment variables:

```bash
cp .env.example .env
```

Update `.env` if your backend is not running on `http://localhost:8088`.

### 7. Start React

```bash
npm run dev
```

Frontend development server:

- App URL: `http://127.0.0.1:5173`

## Development Workflow

### Backend

```bash
source .venv/bin/activate
uvicorn app.main:app --reload --host localhost --port 8088
```

### Frontend

```bash
cd react-ui
npm run dev
```

### Frontend production build

```bash
cd react-ui
npm run build
```

### Frontend lint

```bash
cd react-ui
npm run lint
```

## Project Structure

```text
.
├── alembic/           # Database migration scripts
├── app/               # FastAPI application source
├── react-ui/          # React + Vite frontend
├── alembic.ini        # Alembic configuration
└── requirements.txt   # Python dependencies
```

## Notes

- The backend requires `DATABASE_URL` to be present before the application starts.
- The React app reads `VITE_API_BASE_URL` from `react-ui/.env`.
- Short URLs are persisted in PostgreSQL and managed through Alembic migrations.
