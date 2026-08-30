"""
KelanaAI - Authentication & Authorization Service Layer
Mengelola password hashing (bcrypt), token JWT, dan autentikasi pengguna
untuk mengamankan seluruh API endpoint dan menjaga kepemilikan data perjalanan.
"""

import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

# Memastikan direktori backend berada di sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models.user import User

# Konfigurasi JWT dari environment variables dengan fallback default
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "kelana-ai-super-secret-jwt-key-2026")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Skema OAuth2 Bearer Token untuk FastAPI Depends
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    description="JWT Bearer token untuk autentikasi KelanaAI",
)


def hash_password(password: str) -> str:
    """
    Menghasilkan password hash satu arah yang aman menggunakan bcrypt.
    """
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Memverifikasi apakah plain text password cocok dengan bcrypt password hash yang tersimpan.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Membuat JSON Web Token (JWT) yang ditandatangani secara kriptografis (HS256).
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def register_user(db: Session, name: str, email: str, password: str) -> User:
    """
    Mendaftarkan pengguna baru ke database PostgreSQL setelah memvalidasi
    keberadaan email dan mengenkripsi password dengan bcrypt.
    """
    normalized_email = email.strip().lower()
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        name=name.strip(),
        email=normalized_email,
        password_hash=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    """
    Memvalidasi kredensial login pengguna. Mengembalikan objek User jika valid,
    atau melempar HTTP 401 Unauthorized jika email atau password salah.
    """
    normalized_email = email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI Dependency: Mengidentifikasi dan memvalidasi pengguna yang sedang login
    berdasarkan Bearer JWT token yang dikirim pada HTTP Header Authorization.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user
