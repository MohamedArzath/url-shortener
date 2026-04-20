from calendar import monthrange
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.short_url import ShortUrl


def _add_one_month(value: datetime) -> datetime:
    year = value.year
    month = value.month + 1
    if month == 13:
        month = 1
        year += 1

    day = min(value.day, monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)


def retrieve_all_urls(db: Session, skip: int = 0, limit: int=100):
    query = select(ShortUrl).offset(skip).limit(limit)
    return db.execute(query).scalars().all()


def insert_short_url(db: Session, url, short_code):
    created_date = datetime.utcnow()
    new_url = ShortUrl(
        main_url=url,
        short_url=f"/{short_code}",
        short_code=short_code,
        created_date=created_date,
        expire_date=_add_one_month(created_date),
        status=1,
    )
    db.add(new_url)
    db.commit()
    db.refresh(new_url)
    return new_url


def get_short_url_by_code(db: Session, short_code: str):
    query = select(ShortUrl).where(ShortUrl.short_code == short_code)
    return db.execute(query).scalar_one_or_none()


def delete_short_url(db: Session, url_id: int):
    short_url = db.get(ShortUrl, url_id)
    if short_url is None:
        return None

    db.delete(short_url)
    db.commit()
    return short_url
