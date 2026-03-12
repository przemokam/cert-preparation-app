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

The example file already contains safe local defaults for running the app on your machine.On first start, the app creates a private working database `az500_local.db` from the bundled `az500_dev.db` seed, so your local progress is not written into tracked git files.

### 3. Start the app

```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://localhost:8000`.

For local use, the app redirects through `/dev-login`, creates a development user, and opens the simulator without requiring Microsoft Entra setup.

## Updating to newer published changes

When a newer version is published in this GitHub repo:

```bash
cd cert-preparation-app
git pull origin main
source .venv/bin/activate
pip install -r requirements.txt
```

Then restart the server:

```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Notes:

- `git pull origin main` updates the tracked app files to the newest published version.
- If `requirements.txt` changed, re-running `pip install -r requirements.txt` updates your local environment.
- Your study progress now lives in the ignored local file `az500_local.db`, so normal updates should not be blocked by database changes.
- If you want to rebuild your local working database from the latest bundled seed, delete `az500_local.db` and restart the app.

### One-time migration for older installs

If your existing local copy was created before this change, your app may still have written progress into the tracked `az500_dev.db` file. In that case, stop the server and run this once before pulling:

```bash
git checkout -- az500_dev.db
git pull origin main
```

Then restart the app from the `cert-preparation-app` directory. After the first restart, refresh the local dev session once by opening:

```bash
http://localhost:8000/logout
http://localhost:8000/dev-login
```

This recreates the local development user in the working database if your old session cookie still points at a user record from the pre-migration database state.

Use `git checkout -- az500_dev.db` only for this one-time migration of older installs. For normal local progress resets, delete `az500_local.db` instead.

## Important note

This package is meant for **running** the prepared app locally.

- The ready-to-use database is already included.
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

- Bundled seed database: `az500_dev.db`.
- Local working database: `az500_local.db` (git-ignored, auto-created on first start).
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

The app stores your local study progress in `az500_local.db`. If you want to reset your local progress, delete `az500_local.db` and restart the app.

### Learning / Study button returns 404 after an update

If the page opens but clicking `Study` or starting a session fails after a local update, your browser may still have an old session cookie while the app is now using a rebuilt local database.

- Open `http://localhost:8000/logout`
- Then open `http://localhost:8000/dev-login`
- Refresh the page and try again

This recreates the local development user in `az500_local.db` and fixes the usual `POST /api/exam/start` → `404` case after migrating an older install.