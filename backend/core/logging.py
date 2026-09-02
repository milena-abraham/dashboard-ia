import logging
import sys

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    # Suppress verbose third party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    return logging.getLogger("dashboard_api")

logger = setup_logging()
