import bcrypt
import hashlib, secrets
from datetime import datetime, timedelta, timezone
from core.config import settings

def hash_password(password: str) -> str:
    password_digest = hashlib.sha256(password.encode()).digest()
    return bcrypt.hashpw(password_digest, bcrypt.gensalt()).decode()

def verify_password(plain_pw: str, hashed_pw: str) -> bool:
    password_digest = hashlib.sha256(plain_pw.encode()).digest()
    return bcrypt.checkpw(password_digest, hashed_pw.encode())

def hash_token(token: str) -> str:
    token_digest = hashlib.sha256(token.encode()).digest()
    return bcrypt.hashpw(token_digest, bcrypt.gensalt()).decode()

def verify_token_hash(token: str, hashed_token: str) -> bool:
    token_digest = hashlib.sha256(token.encode()).digest()
    return bcrypt.checkpw(token_digest, hashed_token.encode())

def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def new_raw_token() -> str:
    return secrets.token_urlsafe(settings.TOKEN_BYTES)

def expiry_from_now(minutes: int | None = None):
    ttl = settings.TOKEN_TTL_MIN if minutes is None else minutes
    if ttl <= 0:
        ttl = 1
    return datetime.now(timezone.utc) + timedelta(minutes=ttl)