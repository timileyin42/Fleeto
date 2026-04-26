from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_operator, get_current_rider, get_db
from app.core.database import get_db
from app.models.operator import Operator
from app.models.rider import Rider
from app.repositories.job_repo import JobRepository
from app.services.storage_service import upload_image

router = APIRouter(prefix="/uploads", tags=["uploads"])


class UploadResponse(BaseModel):
    url: str


@router.post("/operator/avatar", response_model=UploadResponse)
async def upload_operator_avatar(
    file: UploadFile,
    operator: Operator = Depends(get_current_operator),
    db: AsyncSession = Depends(get_db),
) -> UploadResponse:
    data = await file.read()
    try:
        url = await upload_image("operators", data, file.filename or "avatar.jpg")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    operator.profile_picture_url = url
    await db.commit()
    return UploadResponse(url=url)


@router.post("/rider/avatar", response_model=UploadResponse)
async def upload_rider_avatar(
    file: UploadFile,
    rider: Rider = Depends(get_current_rider),
    db: AsyncSession = Depends(get_db),
) -> UploadResponse:
    data = await file.read()
    try:
        url = await upload_image("riders", data, file.filename or "avatar.jpg")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    rider.profile_picture_url = url
    await db.commit()
    return UploadResponse(url=url)


@router.post("/jobs/{job_id}/item", response_model=UploadResponse)
async def upload_item_photo(
    job_id: uuid.UUID,
    file: UploadFile,
    operator: Operator = Depends(get_current_operator),
    db: AsyncSession = Depends(get_db),
) -> UploadResponse:
    job_repo = JobRepository(db)
    job = await job_repo.get_by_id(job_id)
    if not job or job.operator_id != operator.id:
        raise HTTPException(status_code=404, detail="Job not found")

    data = await file.read()
    try:
        url = await upload_image("jobs", data, file.filename or "item.jpg")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    job.item_photo_url = url
    await db.commit()
    return UploadResponse(url=url)


@router.post("/jobs/{job_id}/proof", response_model=UploadResponse)
async def upload_delivery_proof(
    job_id: uuid.UUID,
    file: UploadFile,
    rider: Rider = Depends(get_current_rider),
    db: AsyncSession = Depends(get_db),
) -> UploadResponse:
    job_repo = JobRepository(db)
    job = await job_repo.get_by_id(job_id)
    if not job or job.rider_id != rider.id:
        raise HTTPException(status_code=404, detail="Job not found")

    data = await file.read()
    try:
        url = await upload_image("jobs", data, file.filename or "proof.jpg")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    job.proof_photo_url = url
    await db.commit()
    return UploadResponse(url=url)
