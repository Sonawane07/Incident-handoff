# PowerShell development startup script

Write-Host "Starting Incident Handoff Backend..." -ForegroundColor Green

# Activate virtual environment if it exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    & "venv\Scripts\Activate.ps1"
}

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
alembic upgrade head

# Start the server
Write-Host "Starting FastAPI server..." -ForegroundColor Green
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
