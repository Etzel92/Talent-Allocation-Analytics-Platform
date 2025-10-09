import os

import pandas as pd
from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["analytics"])
DF = pd.read_csv(os.path.join(os.path.dirname(__file__), "..", "..", "data", "Employee.csv"))


@router.get("/gender-distribution")
def gender_distribution():
    s = DF["Gender"].value_counts(dropna=True)
    return [{"gender": idx, "count": int(val)} for idx, val in s.items()]
