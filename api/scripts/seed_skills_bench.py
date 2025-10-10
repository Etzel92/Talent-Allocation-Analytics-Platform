from app.db.session import SessionLocal
from app.db.models import Skill, EmployeeSkill, BenchEvent, Employee
from datetime import date
db = SessionLocal()
for n in ["Java","Python","SQL","React","Angular","AWS"]:
    db.merge(Skill(name=n))
db.commit()
emp = db.query(Employee).first()
if emp:
    sk = db.query(Skill).filter(Skill.name=="SQL").first()
    if sk:
        db.merge(EmployeeSkill(employee_id=emp.id, skill_id=sk.id)); db.commit()
    db.add(BenchEvent(employee_id=emp.id, start_date=date(2025,9,1), reason="Proyecto pausado")); db.commit()
db.close()
