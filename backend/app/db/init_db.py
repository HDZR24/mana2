from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
import os

def init_db():
    db = SessionLocal()
    try:
        admin_email = os.getenv("ADMIN_EMAIL")
        admin_password = os.getenv("ADMIN_PASSWORD")
        
        if not admin_email or not admin_password:
            print("⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin creation.")
            return

        admin = db.query(User).filter(User.email == admin_email).first()
        
        if not admin:
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash(admin_password),
                full_name="Admin",
                is_active=True,
                is_superuser=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Admin user created")
        else:
            print("ℹ️ Admin user already exists")
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")
        db.rollback()
    finally:
        db.close()