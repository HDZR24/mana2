from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.security import create_access_token, verify_password, add_to_blacklist, oauth2_scheme
from app.core.config import settings
from app.db.session import get_db
from app.schemas.user import Token, UserLogin, UserCreate, UserInDB
from app.crud.user import get_user_by_email, create_user
from app.crud.medical import create_medical_profile
from app.db.session import get_db

router = APIRouter(tags=["Autenticación"])

@router.post("/login", response_model=Token)
def login(
    form_data: UserLogin,
    db: Session = Depends(get_db)
):
    user = get_user_by_email(db, email=form_data.email)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserInDB)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Crear usuario básico
    created_user = create_user(db=db, user=user)
    
    # Si es diabético, crear perfil médicos
    if user.diabetes and user.medical_profile:
        try:
            create_medical_profile(db, user_id=created_user.id, profile=user.medical_profile)
        except Exception as e:
            # En caso de error, eliminar el usuario creado
            db.delete(created_user)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating medical profile: {str(e)}"
            )
    
    return created_user

@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    add_to_blacklist(token)
    return {"message": "Successfully logged out"}