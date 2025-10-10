from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Si ejecutas como `uvicorn app.main:app`, usa imports absolutos:
from app.routers import auth, employees, reports

app = FastAPI(title="Talent Analytics API")

# Orígenes permitidos (Vite por defecto en 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/health")
def health():
    return {"status": "ok"}


# Routers
app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(reports.router)
