from dotenv import load_dotenv
from os import environ
from pathlib import Path

# Загружаем .env рядом с этим файлом, чтобы переменные подтягивались
# независимо от текущей рабочей директории (uvicorn/daphne/etc).
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

def _clean_base_url(value: str | None) -> str | None:
    if not value:
        return None
    cleaned = value.rstrip("/")
    # если передали уже с /v1 — убираем, позже добавим нужный путь сами
    if cleaned.endswith("/v1"):
        cleaned = cleaned[: -len("/v1")]
    return cleaned

FRONTEND_ORIGIN = environ.get("FRONTEND_ORIGIN")
if FRONTEND_ORIGIN is None:
    raise EnvironmentError("FRONTEND_ORIGIN key not found in env")

JWT_SECRET_KEY = environ.get("JWT_SECRET_KEY")
if JWT_SECRET_KEY is None:
    raise EnvironmentError("JWT_SECRET_KEY not found in env")

JWT_ALGORITHM = environ.get("JWT_ALGORITHM")
if JWT_ALGORITHM is None:
    raise EnvironmentError("JWT_ALGORITHM not found in env")

JWT_ACCESS_TOKEN_EXPIRES_MINUTES = 30
JWT_REFRESH_TOKEN_EXPIRES_DAYS = 14

URL_DATABASE = environ.get("URL_DATABASE")
if URL_DATABASE is None:
    raise EnvironmentError("URL_DATABASE not found in env")

# Scibox configuration (optional)
SCIBOX_API_KEY = environ.get("SCIBOX_API_KEY", "")
# Base URL for Scibox LLM API (no trailing path). Поддерживаем алиас BASE_URL.
SCIBOX_BASE_URL = (
    _clean_base_url(environ.get("SCIBOX_BASE_URL"))
    or _clean_base_url(environ.get("BASE_URL"))
    or "https://llm.t1v.scibox.tech"
)
