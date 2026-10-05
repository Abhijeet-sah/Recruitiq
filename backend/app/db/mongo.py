import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

# Try importing pymongo if available
try:
    from pymongo import MongoClient
    PYMONGO_AVAILABLE = True
except ImportError:
    MongoClient = None
    PYMONGO_AVAILABLE = False

_mongo_client: Optional[Any] = None
_mongo_db: Optional[Any] = None

def get_mongo_uri() -> Optional[str]:
    """Retrieve MongoDB URI from environment variables."""
    return os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or os.getenv("DATABASE_URL_MONGO")

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
        
        now = datetime.utcnow()
        user_doc = {
            "email": email,
            "full_name": user_data.get("full_name"),
            "role": user_data.get("role"),
            "is_active": user_data.get("is_active", True),
            "updated_at": now
        }
        if "created_at" in user_data:
            user_doc["created_at"] = user_data["created_at"]

        users_col.update_one({"email": email}, {"$set": user_doc}, upsert=True)
        
        cred_doc = {
            "email": email,
            "auth_provider": user_data.get("auth_provider", "local"),
            "last_login": now
        }
        if user_data.get("hashed_password"):
            cred_doc["hashed_password"] = user_data["hashed_password"]

        credentials_col.update_one({"email": email}, {"$set": cred_doc}, upsert=True)
        return True
    except Exception as e:
        logger.error(f"Error saving user to MongoDB: {e}")
        return False

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
            return {"configured": True, "status": "connected", "database": db.name}
        except Exception as e:
            return {"configured": True, "status": f"Connection error: {str(e)}"}
    return {"configured": True, "status": "Disconnected"}
