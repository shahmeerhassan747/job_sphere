import sys
import logging
from app.config.config import get_config


def setup_logging() -> None:
    """Configure root logger based on `APP_ENV`.

    - development -> DEBUG
    - production  -> INFO
    This is intentionally small and dependency-free. For more advanced
    setups consider structlog or JSON formatting.
    """
    try:
        cfg = get_config()
        env = getattr(cfg, "APP_ENV", "development")
    except Exception:
        env = "development"

    level = logging.INFO if env == "production" else logging.DEBUG
    fmt = "%(asctime)s %(levelname)s %(name)s: %(message)s"

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(fmt))

    root = logging.getLogger()
    # Replace existing handlers with a simple stdout handler
    root.handlers = []
    root.addHandler(handler)
    root.setLevel(level)

