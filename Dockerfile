FROM node:20-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package.json ./
RUN npm config set registry https://packagefeedproxy.microsoft.io/npm/
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim AS runtime
WORKDIR /app

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir \
    --index-url https://packagefeedproxy.microsoft.io/pypi/simple/ \
    -r /app/backend/requirements.txt

COPY backend/ /app/backend/
COPY --from=frontend-build /workspace/frontend/dist /app/frontend/dist

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--app-dir", "/app/backend", "--host", "0.0.0.0", "--port", "8000"]
