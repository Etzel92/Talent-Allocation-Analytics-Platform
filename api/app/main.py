# api/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Si tus archivos están en api/app/*.py:
from app.analytics import router as an_router
from app.auth import router as auth_router
from app.employee import router as emp_router
from app.export import router as ex_router

app = FastAPI(title="Talent MVP API")

# CORS primero (antes de incluir routers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/health")
def health():
    return {"status": "ok"}


# Luego todos los routers
app.include_router(auth_router)
app.include_router(emp_router)
app.include_router(an_router)
app.include_router(ex_router)
