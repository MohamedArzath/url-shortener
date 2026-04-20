from datetime import datetime
import secrets
import string
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.api.url_shortener import (
    delete_short_url,
    get_short_url_by_code,
    insert_short_url,
    retrieve_all_urls,
)

router = APIRouter()


def init_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class CreateShortUrlRequest(BaseModel):
    url: str


def _is_valid_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def _serialize_short_url(short_url):
    return {
        "id": short_url.id,
        "main_url": short_url.main_url,
        "short_url": short_url.short_url,
        "short_code": short_url.short_code,
        "created_date": short_url.created_date,
        "expire_date": short_url.expire_date,
        "status": short_url.status,
    }


def _generate_short_code(db: Session, length: int = 6) -> str:
    alphabet = string.ascii_letters + string.digits
    for _ in range(10):
        short_code = "".join(secrets.choice(alphabet) for _ in range(length))
        if get_short_url_by_code(db, short_code) is None:
            return short_code

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unable to generate a unique short code",
    )


def _create_short_url(url: str, db: Session):
    if not _is_valid_url(url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid http or https URL is required",
        )

    new_short_url = insert_short_url(db, url, _generate_short_code(db))
    return _serialize_short_url(new_short_url)


@router.get("/all-urls")
def get_all_urls(db: Session = Depends(init_db)):
    return [_serialize_short_url(short_url) for short_url in retrieve_all_urls(db)]


@router.post("/short-urls", status_code=status.HTTP_201_CREATED)
def create_short_url(payload: CreateShortUrlRequest, db: Session = Depends(init_db)):
    return _create_short_url(payload.url, db)


@router.get("/generate-shorturl")
def create_short_url_from_query(url: str, db: Session = Depends(init_db)):
    return _create_short_url(url, db)


@router.delete("/short-urls/{url_id}")
def delete_url(url_id: int, db: Session = Depends(init_db)):
    deleted_short_url = delete_short_url(db, url_id)
    if deleted_short_url is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Short URL not found",
        )

    return {"message": "Short URL deleted", "id": url_id}


@router.get("/{short_code}", include_in_schema=False)
def redirect_to_main_url(short_code: str, db: Session = Depends(init_db)):
    short_url = get_short_url_by_code(db, short_code)
    if short_url is None or not short_url.main_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Short URL not found",
        )

    if short_url.status != 1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Short URL is inactive",
        )

    if short_url.expire_date is not None and short_url.expire_date <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Short URL has expired",
        )

    return RedirectResponse(
        url=short_url.main_url,
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )
