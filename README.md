# cert-preparation-app

Multi-certification exam preparation app with prebuilt question databases, study materials, and spaced-repetition flashcards.

## What this package includes

- Multi-certification support via Certification Hub
- Prebuilt question banks with verified answers and detailed explanations
- Bundled SQLite database (`seed.db`) — **no import required**
- FastAPI backend + Jinja/vanilla JS frontend
- Learning mode with immediate feedback and spaced repetition (Leitner boxes)
- Mock exams with certification-specific timing and question counts
- 7-day study plans with progress tracking
- Study materials and cheatsheets
- Flashcards (exam traps, key facts, tools) with spaced repetition
- Review pool, weak spots analysis, and statistics
- Bilingual UI (EN / DE) and theme toggle (light / dark)

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

The example file already contains safe local defaults for running the app on your machine. On first start, the app creates a private working database `local.db` from the bundled `seed.db` seed, so your local progress is not written into tracked git files.

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
- Your study progress lives in the ignored local file `local.db`, so normal updates should not be blocked by database changes.
- If you want to rebuild your local working database from the latest bundled seed, delete `local.db` and restart the app.

### One-time migration for older installs

If your existing local copy was created before this change, your app may still have written progress into the tracked `seed.db` file. In that case, stop the server and run this once before pulling:

```bash
git checkout -- seed.db
git pull origin main
```

Then restart the app and refresh the local dev session:

```
http://localhost:8000/logout
http://localhost:8000/dev-login
```

Use `git checkout -- seed.db` only for this one-time migration of older installs. For normal local progress resets, delete `local.db` instead.

## Included app areas

- Certification Hub — select and switch between certifications
- Dashboard — readiness snapshot per certification
- Learning mode — question bank with domain filters and immediate feedback
- Mock exams — timed exam simulation with certification-specific settings
- Flashcards — spaced-repetition study cards (exam traps, key facts, tools)
- Study Plan — 7-day structured plan with progress checklist
- Materials — day-by-day study content and cheatsheet
- Review — bookmark pool and error review
- Statistics — accuracy, domain performance, and weak spots

## Runtime notes

- Bundled seed database: `seed.db`.
- Local working database: `local.db` (git-ignored, auto-created on first start).
- Local mode uses SQLite and a dev-login flow.
- Production SSO / cloud deployment configuration is not part of this student package.
- Study materials are bundled in `learning_materials/`.

## Troubleshooting

### App does not start

- Make sure your virtual environment is active.
- Re-run `pip install -r requirements.txt`.
- Confirm you started the server from the `cert-preparation-app` directory.

### Database was modified during local study

The app stores your local study progress in `local.db`. If you want to reset your local progress, delete `local.db` and restart the app.

### Learning / Study button returns 404 after an update

If the page opens but clicking `Study` or starting a session fails after a local update, your browser may still have an old session cookie while the app is now using a rebuilt local database.

- Open `http://localhost:8000/logout`
- Then open `http://localhost:8000/dev-login`
- Refresh the page and try again
