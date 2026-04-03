"""Storage service — handles image uploads to Supabase Storage via REST API."""

import uuid
import logging
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger("navaved.storage")

settings = get_settings()


async def upload_image(
    file_bytes: bytes,
    filename: str,
    content_type: str = "image/jpeg",
) -> Optional[str]:
    """
    Upload an image to Supabase Storage and return the public URL.

    Args:
        file_bytes: Raw bytes of the image file.
        filename: Original filename.
        content_type: MIME type of the image.

    Returns:
        Public URL of the uploaded image, or None on failure.
    """
    logger.info("Uploading image: filename='%s' size=%.2f KB content_type=%s",
                filename, len(file_bytes) / 1024, content_type)

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        logger.error("Supabase Storage NOT configured — SUPABASE_URL or SUPABASE_SERVICE_KEY is empty")
        raise ValueError(
            "Supabase Storage not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY."
        )

    # Generate unique filename to avoid collisions
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
    unique_name = f"products/{uuid.uuid4().hex}.{ext}"
    logger.debug("Generated unique path: '%s'", unique_name)

    upload_url = (
        f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_BUCKET}/{unique_name}"
    )

    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }

    logger.debug("Uploading to: %s", upload_url)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            upload_url,
            content=file_bytes,
            headers=headers,
            timeout=30.0,
        )

        if response.status_code in (200, 201):
            # Return the public URL
            public_url = (
                f"{settings.SUPABASE_URL}/storage/v1/object/public/"
                f"{settings.SUPABASE_BUCKET}/{unique_name}"
            )
            logger.info("Upload SUCCESS: %s (status=%d)", public_url, response.status_code)
            return public_url
        else:
            logger.error("Upload FAILED: status=%d response=%s", response.status_code, response.text[:200])
            raise Exception(
                f"Image upload failed: {response.status_code} — {response.text}"
            )


async def delete_image(image_url: str) -> bool:
    """
    Delete an image from Supabase Storage.

    Args:
        image_url: Full public URL of the image.

    Returns:
        True if deleted, False otherwise.
    """
    logger.info("Deleting image: %s", image_url)

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        logger.warning("Cannot delete — Supabase not configured")
        return False

    # Extract the path from the URL
    prefix = f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_BUCKET}/"
    if not image_url.startswith(prefix):
        logger.warning("Cannot delete — URL does not match Supabase pattern: %s", image_url)
        return False  # Not a Supabase Storage URL

    file_path = image_url[len(prefix):]
    logger.debug("Extracted file path: '%s'", file_path)

    delete_url = (
        f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_BUCKET}"
    )

    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            delete_url,
            json={"prefixes": [file_path]},
            headers=headers,
            timeout=15.0,
        )
        success = response.status_code in (200, 204)
        if success:
            logger.info("Delete SUCCESS: %s", file_path)
        else:
            logger.error("Delete FAILED: status=%d response=%s", response.status_code, response.text[:200])
        return success
