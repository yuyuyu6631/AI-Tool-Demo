FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (layer cache)
COPY apps/api/pyproject.toml ./
RUN pip install --no-cache-dir . && \
    pip install --no-cache-dir gunicorn

# Copy application code
COPY apps/api/app ./app
COPY apps/api/alembic.ini ./
COPY apps/api/alembic ./alembic

# Create non-root user
RUN useradd --system --uid 1001 appuser
USER appuser

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
