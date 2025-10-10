from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from app.core.security import get_password_hash
from app.core.config import settings
from app.db.models import User, RoleEnum
from app.db.session import SessionLocal

def main():
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--email", required=True)
    p.add_argument("--password", required=True)
    p.add_argument("--role", default="HR", choices=["HR","MANAGER","ANALYST"])
    args = p.parse_args()
    db: Session = SessionLocal()
    try:
        if db.query(User).filter(User.email==args.email).first():
            print("User already exists")
            return
        u = User(email=args.email, password_hash=get_password_hash(args.password), role=RoleEnum(args.role))
        db.add(u)
        db.commit()
        print("User created:", args.email, args.role)
    finally:
        db.close()

if __name__ == "__main__":
    main()
