from __future__ import annotations

import asyncio
import logging
import mimetypes
import uuid
from typing import Literal

from app.core.config import settings

logger = logging.getLogger(__name__)

# Allowed image types and their max sizes
_ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
_MAX_BYTES = 100 * 1024 * 1024  # 100 MB

UploadFolder = Literal["operators", "riders", "jobs"]


def _upload_sync(folder: str, filename: str, data: bytes, content_type: str) -> str:
    """Blocking S3/R2 upload — called inside a thread pool."""
    import boto3
    from botocore.config import Config

    endpoint = f"https://{settings.cloudflare_r2_account_id}.r2.cloudflarestorage.com"

    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=settings.cloudflare_r2_access_key_id,
        aws_secret_access_key=settings.cloudflare_r2_secret_access_key,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )

    key = f"{folder}/{filename}"
    client.put_object(
        Bucket=settings.cloudflare_r2_bucket_name,
        Key=key,
        Body=data,
        ContentType=content_type,
    )
    return f"{settings.cloudflare_r2_public_url.rstrip('/')}/{key}"


async def upload_image(folder: UploadFolder, data: bytes, original_filename: str) -> str:
    """
    Validate, then upload an image to Cloudflare R2.
    Returns the public URL.
    Raises ValueError for invalid files.
    Raises RuntimeError if R2 credentials are not configured.
    """
    if not settings.cloudflare_r2_account_id or not settings.cloudflare_r2_access_key_id:
        raise RuntimeError("Cloudflare R2 credentials are not configured")

    if len(data) > _MAX_BYTES:
        raise ValueError("Image must be 5 MB or smaller")

    # Detect content type from filename
    content_type, _ = mimetypes.guess_type(original_filename)
    if content_type not in _ALLOWED_MIME:
        raise ValueError(f"Unsupported file type. Allowed: JPEG, PNG, WebP")

    ext = original_filename.rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"

    url = await asyncio.to_thread(_upload_sync, folder, filename, data, content_type)
    logger.info("Uploaded %s → %s", original_filename, url)
    return url


async def delete_image(public_url: str) -> None:
    """Remove an object from R2 given its public URL. Silently ignores errors."""
    if not settings.cloudflare_r2_public_url:
        return
    try:
        key = public_url.replace(settings.cloudflare_r2_public_url.rstrip("/") + "/", "")
        await asyncio.to_thread(_delete_sync, key)
    except Exception as exc:
        logger.warning("R2 delete failed for %s: %s", public_url, exc)


def _delete_sync(key: str) -> None:
    import boto3
    from botocore.config import Config

    endpoint = f"https://{settings.cloudflare_r2_account_id}.r2.cloudflarestorage.com"
    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=settings.cloudflare_r2_access_key_id,
        aws_secret_access_key=settings.cloudflare_r2_secret_access_key,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )
    client.delete_object(Bucket=settings.cloudflare_r2_bucket_name, Key=key)
