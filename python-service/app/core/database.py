from collections.abc import AsyncGenerator

from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    metadata = MetaData()


# asyncpg doesn't accept sslmode= in the URL — strip it and pass ssl via connect_args
_db_url = settings.database_url.replace("?sslmode=require", "").replace("&sslmode=require", "")
_connect_args = {"ssl": "require"} if "asyncpg" in _db_url else {}

engine = create_async_engine(_db_url, echo=False, connect_args=_connect_args)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
