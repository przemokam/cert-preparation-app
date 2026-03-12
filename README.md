# cert-preparation-app

Student-ready AZ-500 exam practice app with a prebuilt local database.

## What this package includes

- 413 prepared AZ-500 practice questions (`Q1–Q413`)
- bundled SQLite database (`az500_dev.db`) — **no markdown import required**
- FastAPI backend + Jinja/vanilla JS frontend
- bundled study-plan markdown sources for day pages and cheatsheet
- learning mode, mock exam, review pool, analytics, bilingual UI, and theme toggle

## Quick start

### 1. Create a virtual environment

```bash
cd cert-preparation-app
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Copy local environment settings

```bash
cp .env.example .env
```

The example file already contains safe local defaults for running the app on your machine.

### 3. Start the app

```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://localhost:8000`.

For local use, the app redirects through `/dev-login`, creates a development user, and opens the simulator without requiring Microsoft Entra setup.

## Important note

This package is meant for **running** the prepared app locally.

- The ready-to-use database is already included.
- You do **not** need `import_from_markdown.py`.
- Internal authoring/import/verification files were intentionally removed from this package.

## Included contents

```text
cert-preparation-app/
├── README.md
├── .env.example
├── .gitignore
├── requirements.txt
├── az500_dev.db
├── Claude_skany_materiały/
├── backend/
└── frontend/
```

## Runtime notes

- Local database path defaults to `az500_dev.db` in the project root.
- Local mode uses SQLite and a dev-login flow.
- Production SSO / cloud deployment configuration is not part of this student package.
- Source study-material markdown files for `study-plan/day/*` and `/study-plan/cheatsheet` are bundled in `Claude_skany_materiały/Materiały do nauki - notion/`.

## Included app areas

- Dashboard
- Learning mode
- Mock exam
- Review pool
- Statistics
- Frontend translations (`EN` / `DE`)

## Troubleshooting

### App does not start

- Make sure your virtual environment is active.
- Re-run `pip install -r requirements.txt`.
- Confirm you started the server from the `cert-preparation-app` directory.

### Database was modified during local study

The bundled `az500_dev.db` is the working local database. If you want to reset your local progress, replace it with a fresh copy from the original package.
