import io
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Request, Response

router = APIRouter(prefix="/export", tags=["export"])

# Ruta robusta al CSV, sin depender de dónde ejecutes uvicorn
ROOT = Path(__file__).resolve().parents[2]  # /api -> sube a la raíz del monorepo
CSV_PATH = ROOT / "data" / "Employee.csv"
DF = pd.read_csv(CSV_PATH)


@router.get("/Employee.csv")  # <-- esta es la URL que debe existir
def export_employees(request: Request):
    df = DF.copy()
    qp = dict(request.query_params)
    if "city" in qp:
        df = df[df["City"].str.contains(qp["city"], case=False, na=False)]
    if "gender" in qp:
        df = df[df["Gender"].str.lower() == qp["gender"].lower()]
    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    return Response(
        content=csv_buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=employees_export.csv"},
    )
