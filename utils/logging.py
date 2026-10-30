import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path


def configure_logging(logs_dir: Path) -> None:
    """Configure console and rotating file logs."""

    logs_dir.mkdir(parents=True, exist_ok=True)
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    handlers: list[logging.Handler] = [console_handler]

    try:
        file_handler = RotatingFileHandler(
            logs_dir / "app.log",
            maxBytes=5 * 1024 * 1024,
            backupCount=5,
            encoding="utf-8",
        )
        file_handler.setFormatter(formatter)
        handlers.insert(0, file_handler)
    except PermissionError:
        console_handler.handle(
            logging.LogRecord(
                name=__name__,
                level=logging.WARNING,
                pathname=__file__,
                lineno=0,
                msg="Could not open app.log; continuing with console logging only.",
                args=(),
                exc_info=None,
            )
        )

    logging.basicConfig(level=logging.INFO, handlers=handlers, force=True)
