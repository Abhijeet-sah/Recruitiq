import os
import re
import urllib.parse
import logging
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

DEFAULT_MONGO_URI = "mongodb+srv://Abhijeet_sah:Abhijeet%401500@cluster0.jlzc7at.mongodb.net/recruitiq?retryWrites=true&w=majority"

# Try importing pymongo if available
try:
    from pymongo import MongoClient
    PYMONGO_AVAILABLE = True
except ImportError:
    MongoClient = None
    PYMONGO_AVAILABLE = False

_mongo_client: Optional[Any] = None
_mongo_db: Optional[Any] = None

def sanitize_mongo_uri(uri: Optional[str]) -> Optional[str]:
    """Sanitize MongoDB URI by properly URL-encoding username and password."""
    if not uri:
        return uri
    prefix_match = re.match(r'^(mongodb(?:\+srv)?:\/\/)(.*)$', uri)
    if not prefix_match:
        return uri
    prefix, rest = prefix_match.groups()
    if '@' not in rest:
        return uri
    # The last '@' separates credentials from host/database parameters
    last_at_index = rest.rfind('@')
    userinfo = rest[:last_at_index]
    host_and_rest = rest[last_at_index + 1:]
    if ':' in userinfo:
        colon_index = userinfo.find(':')
        username = userinfo[:colon_index]
        password = userinfo[colon_index + 1:]
        # Unquote first to prevent double-encoding, then safely quote
        unquoted_user = urllib.parse.unquote(username)
        unquoted_pass = urllib.parse.unquote(password)
        encoded_user = urllib.parse.quote_plus(unquoted_user)
        encoded_pass = urllib.parse.quote_plus(unquoted_pass)
        return f"{prefix}{encoded_user}:{encoded_pass}@{host_and_rest}"
    return uri

def get_mongo_uri() -> str:
    """Retrieve sanitized MongoDB URI from environment variables or default cluster."""
    raw_uri = (
        os.getenv("MONGODB_URI")
        or os.getenv("MONGO_URI")
        or os.getenv("DATABASE_URL_MONGO")
        or DEFAULT_MONGO_URI
    )
    return sanitize_mongo_uri(raw_uri) or DEFAULT_MONGO_URI

def init_mongo() -> Optional[Any]:
    """Initialize MongoDB connection if URI is configured."""
    global _mongo_client, _mongo_db
    if _mongo_db is not None:
        return _mongo_db

    uri = get_mongo_uri()
    if not uri or not PYMONGO_AVAILABLE:
        return None

    try:
        _mongo_client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # Select database (default to 'recruitiq' if not specified in URI)
        db_name = os.getenv("MONGODB_DB_NAME", "recruitiq")
        _mongo_db = _mongo_client[db_name]
        logger.info(f"Connected to MongoDB database: {db_name}")
        return _mongo_db
    except Exception as e:
        logger.warning(f"Failed to connect to MongoDB: {e}")
        return None

def save_user_credential_to_mongo(user_data: Dict[str, Any]) -> bool:
    """Save or update user credentials in MongoDB."""
    db = init_mongo()
    if db is None:
        return False
    try:
        users_col = db["users"]
        credentials_col = db["credentials"]
        email = user_data.get("email", "").lower().strip()
        if not email:
            return False
        
        now = datetime.utcnow()
        user_doc = {
            "email": email,
            "full_name": user_data.get("full_name"),
            "role": user_data.get("role"),
            "is_active": user_data.get("is_active", True),
            "updated_at": now
        }
        if "created_at" in user_data and user_data["created_at"]:
            user_doc["created_at"] = user_data["created_at"]

        users_col.update_one({"email": email}, {"$set": user_doc}, upsert=True)
        
        cred_doc = {
            "email": email,
            "auth_provider": user_data.get("auth_provider", "local"),
            "last_login": now
        }
        if user_data.get("hashed_password"):
            cred_doc["hashed_password"] = user_data["hashed_password"]
        if user_data.get("provider_id"):
            cred_doc["provider_id"] = user_data["provider_id"]

        credentials_col.update_one({"email": email}, {"$set": cred_doc}, upsert=True)
        return True
    except Exception as e:
        logger.error(f"Error saving user to MongoDB: {e}")
        return False

def get_user_from_mongo(email: str) -> Optional[Dict[str, Any]]:
    """Retrieve user and credentials by email from MongoDB."""
    db = init_mongo()
    if db is None:
        return None
    try:
        email_clean = email.lower().strip()
        user_doc = db["users"].find_one({"email": email_clean})
        if not user_doc:
            return None
        cred_doc = db["credentials"].find_one({"email": email_clean}) or {}
        return {
            "email": email_clean,
            "full_name": user_doc.get("full_name") or "User",
            "role": user_doc.get("role", "CANDIDATE"),
            "is_active": user_doc.get("is_active", True),
            "hashed_password": cred_doc.get("hashed_password"),
            "auth_provider": cred_doc.get("auth_provider", "local"),
            "provider_id": cred_doc.get("provider_id"),
            "created_at": user_doc.get("created_at")
        }
    except Exception as e:
        logger.error(f"Error reading user from MongoDB: {e}")
        return None

def sync_mongo_and_sqlite() -> Dict[str, int]:
    """
    Bidirectionally synchronizes SQLite and MongoDB:
    1. Mirrors any local SQLite users into MongoDB.
    2. Restores any MongoDB users into SQLite if not present locally (e.g. after Render disk reset).
    """
    stats = {"sqlite_to_mongo": 0, "mongo_to_sqlite": 0}
    db = init_mongo()
    if db is None:
        return stats

    try:
        from app.db.session import SessionLocal
        from app.models.user import User, UserRole
        from app.models.candidate import CandidateProfile, RecruiterProfile
        from app.core.security import get_password_hash

        session = SessionLocal()
        try:
            # 1. Push all SQLite users to MongoDB
            sqlite_users = session.query(User).all()
            for u in sqlite_users:
                save_user_credential_to_mongo({
                    "email": u.email,
                    "full_name": u.full_name,
                    "role": u.role.value if hasattr(u.role, "value") else str(u.role),
                    "hashed_password": u.hashed_password,
                    "auth_provider": "local",
                    "is_active": u.is_active,
                    "created_at": u.created_at
                })
                stats["sqlite_to_mongo"] += 1

            # 2. Restore any MongoDB users missing in SQLite
            sqlite_emails = {u.email.lower() for u in sqlite_users}
            mongo_users = list(db["users"].find())
            for mu in mongo_users:
                m_email = mu.get("email", "").lower().strip()
                if not m_email or m_email in sqlite_emails:
                    continue

                m_cred = db["credentials"].find_one({"email": m_email}) or {}
                hashed_pwd = m_cred.get("hashed_password") or get_password_hash("recruitiq2026")
                role_str = mu.get("role", "CANDIDATE").upper()
                target_role = UserRole.RECRUITER if role_str == "RECRUITER" else UserRole.CANDIDATE

                new_user = User(
                    email=m_email,
                    hashed_password=hashed_pwd,
                    full_name=mu.get("full_name") or m_email.split("@")[0].capitalize(),
                    role=target_role,
                    is_active=mu.get("is_active", True)
                )
                session.add(new_user)
                session.flush()

                if new_user.role == UserRole.CANDIDATE:
                    cand = CandidateProfile(
                        user_id=new_user.id,
                        summary=f"Account restored for {new_user.full_name}.",
                        education_level="Bachelor's Degree",
                        years_of_experience=1.0,
                        demographic_gender="Unspecified",
                        demographic_age_group="25-34"
                    )
                    session.add(cand)
                elif new_user.role == UserRole.RECRUITER:
                    rec = RecruiterProfile(
                        user_id=new_user.id,
                        company_name="RecruitIQ Enterprise",
                        department="Talent Acquisition",
                        title="Talent Specialist"
                    )
                    session.add(rec)

                session.commit()
                sqlite_emails.add(m_email)
                stats["mongo_to_sqlite"] += 1

        finally:
            session.close()

    except Exception as e:
        logger.error(f"Error in sync_mongo_and_sqlite: {e}")

    return stats

def check_mongo_status() -> Dict[str, Any]:
    """Check health and connectivity of MongoDB."""
    uri = get_mongo_uri()
    if not uri:
        return {"configured": False, "status": "Not configured (no MONGODB_URI set)"}
    if not PYMONGO_AVAILABLE:
        return {"configured": True, "status": "pymongo package not installed"}
    
    db = init_mongo()
    if db is not None:
        try:
            db.command("ping")
            user_count = db["users"].count_documents({})
            cred_count = db["credentials"].count_documents({})
            return {
                "configured": True,
                "status": "connected",
                "database": db.name,
                "users_count": user_count,
                "credentials_count": cred_count
            }
        except Exception as e:
            return {"configured": True, "status": f"Connection error: {str(e)}"}
    return {"configured": True, "status": "Disconnected"}
