from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.database.connection import engine
from app.model import models
from app.router import students, auth, books, holds

ALLOWED_IPS = ["192.168.1.34", "127.0.0.1", "::1", "192.168.1.73", "10.0.0.5"]

class NetworkFilterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        client_ip = request.client.host
        return await call_next(request)

# Auto-create tables if they don't exist yet
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Alexandria API Engine",
    version="1.0.0",
    description="Scalable system service interface managing library data schemas"
)

# CORSMiddleware MUST be added AFTER custom middlewares so it wraps responses last
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(NetworkFilterMiddleware)

app.include_router(books.router)
app.include_router(auth.router)
app.include_router(holds.router)
app.include_router(students.router)

@app.get("/")
def health_check():
    return {"status": "operational", "service": "Alexandria Backend Terminal Engine"}