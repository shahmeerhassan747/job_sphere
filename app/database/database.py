import os
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from typing import Optional, Generator
from logging import getLogger

from app.config.config import get_config

logger = getLogger(__name__)
 
# Declarative base used by models (must exist at import time)
Base = declarative_base()

# Global engine and session factory
engine: Optional[sa.engine.Engine] = None
SessionLocal: Optional[sessionmaker] = None


def init_engine(
    url: Optional[str] = None,
    *,
    echo: Optional[bool] = None,
    pool_size: int = 5,
    max_overflow: int = 10,
) -> sa.engine.Engine:
    """
    Initialize the SQLAlchemy Engine and SessionLocal singleton.
    """
    global engine, SessionLocal
    if engine is not None:
        return engine

    if url is None:
        config = get_config() 
        url = config.database_url()

    # Determine echo/logging behaviour:
    # - If echo param is explicitly provided (True/False), use it.
    # - Otherwise consult env var DATABASE_LOGGING (1/true/yes) to enable SQL echo.
    env_logging = os.getenv("DATABASE_LOGGING", "false").lower() in ("1", "true", "yes")
    if echo is None:
        use_echo = env_logging
    else:
        use_echo = bool(echo)

    # Configure SQLAlchemy engine and basic logging for DB-related loggers when requested.
    engine = sa.create_engine(
        url,
        echo=use_echo,
        future=True,
        pool_pre_ping=True,
        pool_size=pool_size,
        max_overflow=max_overflow,
    )

    if env_logging:
        # Configure python logging for sqlalchemy and connection pool to DEBUG/INFO so SQL appears on stdout/file
        import logging
        logging.getLogger("sqlalchemy.engine").setLevel(logging.DEBUG)
        logging.getLogger("sqlalchemy.pool").setLevel(logging.INFO)
        # Optionally enable psycopg logging if available
        for name in ("psycopg", "psycopg2", "psycopg_pool"):
            try:
                logging.getLogger(name).setLevel(logging.INFO)
            except Exception:
                pass
        # If a DB log path is provided, add a FileHandler so developers can fetch recent DB logs
        db_log_path = os.getenv("DB_LOG_PATH", "./logs/db.log")
        try:
            os.makedirs(os.path.dirname(db_log_path), exist_ok=True)
        except Exception:
            pass
        try:
            fh = logging.FileHandler(db_log_path)
            fh.setLevel(logging.DEBUG)
            fmt = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
            fh.setFormatter(fmt)
            logging.getLogger("sqlalchemy.engine").addHandler(fh)
        except Exception:
            # if file handler cannot be created, continue without crashing
            logger.exception("Failed to create DB log file handler")

    SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False, 
        bind=engine,
        class_=Session,
    )

    return engine


def dispose_engine() -> None:
    """Dispose the global engine and reset the SessionLocal factory."""
    global engine, SessionLocal
    if engine:
        engine.dispose()
        engine = None
        SessionLocal = None


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session.
    """
    if SessionLocal is None:
        init_engine()

    # Create the session from the factory (which must exist now)
    db_factory = SessionLocal
    if db_factory is None:
         raise RuntimeError("Failed to initialize database session factory")
         
    db: Session = db_factory()
    try:
        yield db
    finally:
        db.close()


def init_app(app) -> None:
    """
    Attach startup and shutdown handlers to a FastAPI app to manage the DB engine.
    """

    @app.on_event("startup")
    async def _startup_db():
        # Initialize engine lazily. If the environment requests skipping the
        # startup DB check (useful in development), honor that.
        eng = init_engine()
        skip_check = os.getenv("SKIP_DB_CHECK", "false").lower() in ("1", "true", "yes")
        if skip_check:
            logger.info("SKIP_DB_CHECK is set; skipping DB connection test at startup")
            return

        # test DB connection (fail-fast if it cannot connect)
        try:
            with eng.connect() as conn:
                conn.execute(sa.text("SELECT 1"))
        except Exception as exc:
            logger.exception("Database connection failed at startup")
            raise RuntimeError("Database connection failed at startup") from exc

    @app.on_event("shutdown")
    async def _shutdown_db():
        dispose_engine()
