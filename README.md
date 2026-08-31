# GenoRoot Hair & Scalp Intake

A multi-step patient intake form for hair and scalp consultation. Built as a React SPA talking to a Django REST API backed by PostgreSQL.

---

## Table of Contents

1. [Overview](#overview)
2. [Why This Stack](#why-this-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Local Installation](#local-installation)
6. [Running Tests](#running-tests)
7. [Environment Variables](#environment-variables)
8. [Deployment (Render)](#deployment-render)

---

## Overview

GenoRoot is a clinical intake tool that guides patients through five sections — Personal & Family History, Hormonal Health, Lifestyle, Hair Treatments, and Sample Consent — before submitting to a backend that validates and stores the response.

The form adapts based on patient sex (female-only hormonal questions), enforces cross-field business rules (paired-null toggles, mutual-exclusion multi-selects), and lets patients review all answers before final submission.

---

## Why This Stack

### React 18 + Vite
The intake form has conditional branching (sex-gated screens), section transitions, and a full review/edit cycle. React's `useReducer` handles the 30+ field global state cleanly. Vite gives instant hot-reload during development with no configuration.

### Django + Django REST Framework
DRF's `Serializer` pattern maps directly to the section-by-section structure of the form. Each section is a nested serializer with its own `validate()` method enforcing business rules (cross-field checks, enum constraints). Python's readability keeps medical domain logic auditable.

### PostgreSQL
Submissions are stored as JSONB in a single `responses` column — flexible enough to evolve the schema without migrations, while remaining queryable and transactional. The `IntakeSubmission` model stays intentionally thin.

### `references/schema.json` — single source of truth
All form field options live in one JSON file. `schema_constants.py` parses it at startup and exposes typed constants. Serializers import from there — option lists are never hand-typed twice.

### pytest + pytest-django
Section serializers are pure Python — tests run without a database connection in milliseconds. The test suite covers valid baselines, invalid mutations, and cross-field edge cases for every section.

---

## Architecture

```
Browser
  │  React SPA (Vite build)
  │  POST /api/intake/submit/ — JSON
  ▼
┌─────────────────────────────┐
│  Django REST Framework       │
│  IntakeSubmitView (APIView)  │
│  IntakeSubmissionSerializer  │
│    └─ 5 nested serializers   │
│    └─ cross-field validate() │
└──────────┬──────────────────┘
           │ psycopg2
           ▼
     PostgreSQL
     intake_intakesubmission
     (id, responses JSONB, status, created_at)
```

**No session auth, no CSRF.** This is a public intake form — no login, no cookies. CORS (`django-cors-headers`) restricts browser access to the configured frontend origin. DRF's `APIView` is CSRF-exempt by design.

**Static files.** WhiteNoise serves Django's admin/static assets directly from Gunicorn. The React build is a separate Render Static Site served from CDN.

---

## Project Structure

```
.                              ← git root
├── .github/
│   └── workflows/ci.yml      ← GitHub Actions (pytest + vite build)
├── .gitignore
├── references/
│   └── schema.json           ← single source of truth for all form options
└── genoroot-intake/
    ├── .gitignore
    ├── backend/
    │   ├── config/
    │   │   ├── settings.py
    │   │   ├── urls.py
    │   │   └── wsgi.py
    │   ├── intake/
    │   │   ├── models.py          ← IntakeSubmission
    │   │   ├── serializers.py     ← 5 section serializers + top-level
    │   │   ├── schema_constants.py← parses schema.json at startup
    │   │   ├── views.py           ← IntakeSubmitView
    │   │   ├── urls.py
    │   │   ├── migrations/
    │   │   └── tests/
    │   │       ├── conftest.py    ← valid_male_submission fixture
    │   │       ├── test_lifestyle.py
    │   │       ├── test_personal_family.py
    │   │       ├── test_treatments.py
    │   │       ├── test_sample_consent.py
    │   │       ├── test_full_submission.py
    │   │       └── test_views.py
    │   ├── build.sh               ← Render deploy script
    │   ├── manage.py
    │   ├── pytest.ini
    │   └── requirements.txt
    └── frontend/
        ├── src/
        │   ├── api/
        │   │   └── intakeApi.js       ← fetch layer
        │   ├── components/
        │   │   ├── screens/           ← 12 form screens
        │   │   ├── review/            ← ReviewScreen
        │   │   └── shared/            ← ProgressBar, StickyContinueButton, ToggleRow
        │   ├── state/
        │   │   └── intakeReducer.js   ← useReducer global state
        │   ├── App.jsx
        │   ├── ErrorBoundary.jsx
        │   └── main.jsx
        ├── .env.example
        ├── index.html
        ├── package.json
        └── vite.config.js
```

---

## Local Installation

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.11+ | `python --version` |
| Node.js | 18+ | `node --version` |
| PostgreSQL | 14+ | `psql --version` |
| npm | 9+ | `npm --version` |

---

### Step 1 — Clone the repo

```bash
git clone <your-repo-url>
cd <repo-root>
```

---

### Step 2 — Backend setup

```bash
cd genoroot-intake/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt
```

**Create your local `.env` file:**

```bash
cp .env.example .env
```

Open `backend/.env` and fill in your local values:

```env
SECRET_KEY=any-random-string-for-local-dev
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=genoroot_intake
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

**Create the database and run migrations:**

```bash
# In psql or pgAdmin, create the database first:
# CREATE DATABASE genoroot_intake;

python manage.py migrate
```

---

### Step 3 — Frontend setup

```bash
cd genoroot-intake/frontend

npm install
```

The frontend reads `VITE_API_BASE_URL` from `.env`. For local dev the default (empty string) proxies through Vite. No `.env` file is required unless you need to override the API URL.

---

### Step 4 — Run both servers

Open two terminals:

**Terminal 1 — Django:**
```bash
cd genoroot-intake/backend
source venv/bin/activate
python manage.py runserver
# Running at http://localhost:8000
```

**Terminal 2 — Vite:**
```bash
cd genoroot-intake/frontend
npm run dev
# Running at http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Running Tests

```bash
cd genoroot-intake/backend
source venv/bin/activate

# Run all tests
pytest

# Run a specific file with verbose output
pytest intake/tests/test_lifestyle.py -v

# Run with short tracebacks
pytest --tb=short -q
```

Tests do **not** require a database connection — serializer tests are pure Python. View tests (`test_views.py`) use `@pytest.mark.django_db` and spin up an in-memory test DB automatically.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Django secret key |
| `DEBUG` | Yes | `True` for local, `False` for production |
| `ALLOWED_HOSTS` | Yes | Comma-separated list of allowed hosts |
| `DATABASE_URL` | Render only | Full Postgres URL — set automatically when you link a Render DB |
| `DB_NAME` | Local only | Postgres database name |
| `DB_USER` | Local only | Postgres username |
| `DB_PASSWORD` | Local only | Postgres password |
| `DB_HOST` | Local only | Postgres host |
| `DB_PORT` | Local only | Postgres port |
| `CORS_ALLOWED_ORIGINS` | Yes | Comma-separated frontend origins |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `''` (same origin) | Backend URL in production |

---

## Deployment (Render)

Three services — one for each component:

| Service | Type | Root Dir |
|---------|------|----------|
| PostgreSQL | Database | — |
| Django API | Web Service | `genoroot-intake/backend` |
| React App | Static Site | `genoroot-intake/frontend` |

**Backend Web Service settings:**
- Build Command: `./build.sh`
- Start Command: `gunicorn config.wsgi:application`
- Add all backend env vars in the Environment tab
- Link the PostgreSQL database — Render auto-sets `DATABASE_URL`

**Frontend Static Site settings:**
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`

`build.sh` runs on every deploy: `pip install` → `collectstatic` → `migrate`.
