import csv
import pathlib

from sqlalchemy.orm import Session

from app.db import models
from app.db.session import engine

CSV = pathlib.Path(__file__).resolve().parents[2] / "data" / "Employee.csv"


def run():
    models.Base.metadata.create_all(bind=engine)
    with Session(engine) as s, CSV.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        rows = []
        for row in r:
            emp = models.Employee(
                education=row["Education"],
                joining_year=int(row["JoiningYear"]),
                city=row["City"],
                payment_tier=int(row["PaymentTier"]),
                age=int(row["Age"]),
                gender=row["Gender"],
                ever_benched=row["EverBenched"],  # "Yes"/"No"
                years_experience=int(row["ExperienceInCurrentDomain"]),
                leave_or_not=int(row["LeaveOrNot"]),
            )
            rows.append(emp)
        s.add_all(rows)
        s.commit()


if __name__ == "__main__":
    run()
