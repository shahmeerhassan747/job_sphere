#!/usr/bin/env python3
import os
import re
import sys


def resolve_raw():
    """Resolve DATABASE_URL preferring env var, then app config, then HARD_CODED_DATABASE_URL."""
    # First check for direct DATABASE_URL env var
    url = os.getenv("DATABASE_URL")
    if url:
        return url

    # Then try to get URL from app config (which now supports both formats)
    try:
        from app.config.config import get_config

        cfg_url = get_config().database_url()
        if cfg_url:
            return cfg_url
    except Exception:
        # If app config fails, try building URL from individual env vars
        try:
            db_user = os.getenv("DB_USER")
            db_password = os.getenv("DB_PASSWORD")
            db_host = os.getenv("DB_HOST")
            db_port = os.getenv("DB_PORT", "5432")
            db_name = os.getenv("DB_NAME")
            db_engine = os.getenv("DB_ENGINE", "postgresql+psycopg2")
            
            if all([db_user, db_password, db_host, db_name]):
                # Build URL from individual components
                # Apply localhost workaround
                if db_host.lower() == "localhost":
                    db_host = "127.0.0.1"
                return f"{db_engine}://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        except Exception:
            pass

    return os.getenv("HARD_CODED_DATABASE_URL", "")


def to_psql_url(raw_url: str) -> str:
    # Convert SQLAlchemy-style scheme like 'postgresql+psycopg2:' to 'postgresql:'
    if not raw_url:
        return ""
    return re.sub(r'^postgresql\+[^:]+:', 'postgresql:', raw_url)


def main():
    raw = resolve_raw()
    if len(sys.argv) > 1 and sys.argv[1] in ('--psql', '-p'):
        print(to_psql_url(raw))
    elif len(sys.argv) > 1 and sys.argv[1] in ('--password', '-w'):
        # Extract password part from URL if present
        # support formats: postgresql://user:pass@host/db or postgresql+driver://user:pass@host/db
        m = re.search(r"^[^:]+://[^:@]+:([^@]+)@", raw or "")
        print(m.group(1) if m else "")
    else:
        print(raw)


if __name__ == '__main__':
    main()
