"""Alembic env.py
This env is tailored for the project's layout. It pulls the DB URL from
`alembic.ini` if provided, or falls back to the application's `get_config()`
helper (which reads .env via Pydantic) so `make revision`/`alembic` work
without duplicating secrets into this file.
It imports the application's SQLAlchemy `Base` and the module that defines
models so `target_metadata` is populated for autogeneration.
"""
from __future__ import annotations

import logging
from logging.config import fileConfig
from typing import Optional

from sqlalchemy import engine_from_config, pool
from sqlalchemy import create_engine
from alembic import context

# Alembic Config object (from alembic.ini)
config = context.config

# set up logging from the config file (if present)
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import application's config helper and SQLAlchemy Base so autogenerate can
# inspect models. Importing `app.database.schema` ensures all model classes
# are defined and attached to `Base.metadata`.
import sys
from pathlib import Path

# Ensure the project root is on sys.path so `app` imports work when alembic
# runs from the venv or from a different working directory.
project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))

from app.config.config import get_config
from app.database.database import Base
import app.database.schema  # noqa: F401  (module side-effects: registers models)

# Target metadata for 'autogenerate'
target_metadata = Base.metadata

def _get_url_from_config() -> Optional[str]:
    """Return the DB URL to use for Alembic.
    Priority:
      1. value in alembic.ini (sqlalchemy.url)
      2. application config (get_config().database_url())
      3. None
    """
    url = config.get_main_option("sqlalchemy.url")
    
    # DEBUG: Check if URL comes from alembic.ini
    if url:
        print(f"🔍 [DEBUG] Using DB URL from alembic.ini: {url}")
        return url

    # fall back to application config (.env, pydantic settings)
    try:
        app_cfg = get_config()
        url = app_cfg.database_url()
        
        # DEBUG: Check if URL comes from .env via Pydantic
        print(f"🔍 [DEBUG] Using DB URL from app config (.env): {url}")
        
        # set it on the alembic config so downstream helpers can see it
        config.set_main_option("sqlalchemy.url", url)
        return url
    except Exception as exc:  # pragma: no cover - environment dependent
        logging.getLogger(__name__).warning("Failed to read app config for DB URL: %s", exc)
        print(f"❌ [ERROR] Failed to load DB URL from config: {exc}")
        return None

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (no DB connection required).
    This generates SQL scripts that can be reviewed or applied later.
    """
    url = _get_url_from_config() or ""

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode (connect to DB and run against it)."""
    # Ensure alembic config has a proper sqlalchemy.url set.
    url = _get_url_from_config()

    if not url:
        raise ValueError("DB URL is missing. Check your .env file or alembic.ini")

    if url:
        # Use engine_from_config when alembic.ini contains options
        connectable = engine_from_config(
            config.get_section(config.config_ini_section, {}),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
        )
    else:
        # Last-resort: create engine directly from app config
        connectable = create_engine(url, future=True)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            render_as_batch=False,
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
