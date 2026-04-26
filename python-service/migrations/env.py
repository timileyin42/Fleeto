from __future__ import annotations

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# ── Load app config & models ──────────────────────────────────────────────────
from app.core.config import settings
import app.models  # noqa: F401 — registers all ORM models with Base.metadata
from app.core.database import Base

_ = app.models  # silence linters

# ── Alembic config ────────────────────────────────────────────────────────────
alembic_cfg = context.config

if alembic_cfg.config_file_name is not None:
    fileConfig(alembic_cfg.config_file_name)

# Convert asyncpg URL → standard postgresql URL for the sync offline mode,
# keep asyncpg for the async online mode.
_async_url = settings.database_url
_sync_url  = _async_url.replace("postgresql+asyncpg://", "postgresql://")

alembic_cfg.set_main_option("sqlalchemy.url", _sync_url)

target_metadata = Base.metadata


# ── Offline mode (generates SQL script without connecting) ────────────────────

def run_migrations_offline() -> None:
    context.configure(
        url=_sync_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online async mode (connects and runs migrations) ─────────────────────────

def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    cfg_section = alembic_cfg.get_section(alembic_cfg.config_ini_section, {})
    cfg_section["sqlalchemy.url"] = _async_url

    connectable = async_engine_from_config(
        cfg_section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


# ── Entry point ───────────────────────────────────────────────────────────────

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
