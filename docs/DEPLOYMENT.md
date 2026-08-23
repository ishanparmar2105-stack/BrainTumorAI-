# Deployment Guide — BrainTumorAI

This guide details how to build and deploy BrainTumorAI using Docker Compose for staging and production environments.

---

## 1. Container Configuration

The system uses a **multi-stage Dockerfile** to build both the frontend and backend, serving the compiled frontend from Nginx.

- **Backend Container**:
  - Base: `python:3.11-slim`
  - Runs FastAPI on port 8000 using `uvicorn`.
- **Frontend Container**:
  - Base: `node:20-alpine` (for builds) → `nginx:alpine` (for hosting).
  - Listens on port 80, proxying `/api/` calls to the backend container.

---

## 2. Running via Docker Compose

To start the system in production mode:

1. Create a production `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set a secure `SECRET_KEY` and update configurations.
3. Build and launch all containers:
   ```bash
   docker-compose up --build -d
   ```
4. Verify containers are active:
   ```bash
   docker-compose ps
   ```

---

## 3. Scale and Storage Considerations
- **Database**: When scaling to multiple server instances, replace the SQLite file path in `DATABASE_URL` with a connection string for a managed PostgreSQL cluster.
- **S3 Storage**: The current `StorageService` can be easily modified to write bytes directly to S3 bucket APIs or compatible storage, rather than the local filesystem.
