from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, employees, reports
from app.routers import skills, bench, assignments

app = FastAPI(title="Talent Analytics API")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,   # ok si usas Authorization o cookies
    allow_methods=["*"],
    allow_headers=["*"],      # incluye Authorization
)

@app.get("/health")
def health():
    return {"status": "ok"}

# Routers
app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(reports.router)
app.include_router(skills.router)
app.include_router(bench.router)
app.include_router(assignments.router)
