from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """Validate bearer token and retrieve user."""
    payload = decode_access_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired authentication token")

    email: str = payload.get("sub")
    if not email:
        raise UnauthorizedException("Token missing subject claim")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise UnauthorizedException("User associated with this token no longer exists")

    if not user.is_active:
        raise ForbiddenException("User account is inactive")

    return user

def require_role(*allowed_roles: UserRole):
    """Dependency enforcing role-based access control."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles and current_user.role != UserRole.ADMIN:
            raise ForbiddenException(
                f"Access forbidden: User role '{current_user.role.value}' does not have permission. Required: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker
