# AI WebApp Analyze Image (Python)

This project implements an MVP image analysis web app with:
- Frontend: React + Tailwind CSS
- Backend: FastAPI (Python 3.12)
- AI service: Microsoft Foundry
- Inference API: OpenAI Responses API
- SDK: OpenAI Python SDK (OpenAI client)

## Features
- Upload JPG/PNG image (max 10 MB)
- Preview image in fixed 16:9 area
- Analyze image through `/api/analyze`
- Show markdown analysis result
- Disable interactions and show spinner while analysis runs
- Log main steps and errors to stdout

## Repository Layout
- `frontend/`: React application
- `backend/`: FastAPI API and Azure OpenAI integration
- `doc/`: requirements and planning docs
- `Dockerfile`: container build for frontend + backend

## Local Development

### 1. Frontend setup for production (Preferred)
This resembles the production env. A single port 8000 is used.
1. Install dependencies:
   - `cd frontend && npm install`
2. Start dev server:
   - `npm run build`
3. After backend setup, open `http://localhost:8000`

### 2. Backend setup
1. Create and activate a Python 3.12 virtual environment.
   - python -m venv .venv
   - .venv\Scripts\activate
2. Install packages:
   - `pip install -r backend/requirements.txt`
3. Copy config:
   - copy `backend/.env.example` to `backend/.env`
4. Set values in `backend/.env`:
   - `OPENAI_ENDPOINT`
   - `MODEL_DEPLOYMENT_NAME`
   - Note: `backend/.env` is loaded automatically by the backend at startup.
5. Run backend:
   - `uvicorn app.main:app --app-dir backend --reload --port 8000`

### 3. Frontend setup for dev (Alternative)
This dev alternative uses a 2-port approach. Frontend listens to a different port.
1. Install dependencies:
   - `cd frontend && npm install`
2. Start dev server:
   - `npm run dev`
3. Open `http://localhost:5173`

The frontend proxies `/api` requests to `http://localhost:8000` in development.

## API
- `POST /api/analyze`
  - Form field: `image`
  - Allowed MIME types: `image/jpeg`, `image/png`
  - Max file size: 10 MB
  - Response: `{ "requestId": "...", "analysisMarkdown": "..." }`
- `GET /api/health`
  - Response: `{ "status": "ok" }`

## Container Build
Build and run from the repository root:
- `docker build -t image-analyzer .`
- `docker run --rm -p 8000:8000 -e OPENAI_ENDPOINT=<endpoint> -e MODEL_DEPLOYMENT_NAME=<deployment> image-analyzer`

Then open `http://localhost:8000`.
