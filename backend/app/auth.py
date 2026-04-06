from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional
from supabase import create_client, Client
from .config import settings
from .database import get_db
from .models import User
import httpx

security = HTTPBearer()

# Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


async def verify_supabase_token(token: str) -> dict:
    """Verify Supabase JWT token"""
    try:
        # Get Supabase JWT secret from JWKS endpoint
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.SUPABASE_URL}/auth/v1/jwks")
            jwks = response.json()
        
        # Verify token
        user_data = supabase.auth.get_user(token)
        if user_data and user_data.user:
            return {
                "sub": user_data.user.id,
                "email": user_data.user.email
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    
    try:
        payload = await verify_supabase_token(token)
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    # Get or create user in database
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Create user if doesn't exist (first time login)
        user = User(id=user_id, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require admin role"""
    if current_user.global_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def check_incident_permission(
    user: User,
    incident,
    required_role: Optional[str] = None
) -> bool:
    """Check if user has permission to access incident"""
    # Commander always has access
    if incident.commander_id == user.id:
        return True
    
    # Check incident roles
    user_role = None
    for role in incident.roles:
        if role.user_id == user.id:
            user_role = role.role
            break
    
    if user_role is None:
        return False
    
    # If specific role required, check it
    if required_role:
        if required_role == "commander":
            return incident.commander_id == user.id
        elif required_role == "responder":
            return user_role in ["responder", "commander"]
        elif required_role == "viewer":
            return user_role in ["viewer", "responder", "commander"]
    
    return True
