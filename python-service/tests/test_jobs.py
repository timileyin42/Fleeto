import pytest

from app.core.exceptions import AppException
from app.core.security import hash_password
from app.models.enums import JobStatus
from app.models.operator import Operator
from app.models.rider import Rider
from app.repositories.job_repo import JobRepository
from app.repositories.location_repo import LocationRepository
from app.repositories.operator_repo import OperatorRepository
from app.repositories.rider_repo import RiderRepository
from app.schemas.job import JobCreate
from app.services.job_service import JobService
from app.services.tracking_service import TrackingService


async def _create_operator(session) -> Operator:
    operator = Operator(name="Tunde", email="tunde@test.com", hashed_password=hash_password("pass"))
    session.add(operator)
    await session.commit()
    await session.refresh(operator)
    return operator


async def _create_rider(session, operator_id) -> Rider:
    rider = Rider(
        operator_id=operator_id,
        name="Emeka",
        phone="08012345678",
        hashed_password=hash_password("pass"),
    )
    session.add(rider)
    await session.commit()
    await session.refresh(rider)
    return rider


def _job_service(db):
    return JobService(job_repo=JobRepository(db), rider_repo=RiderRepository(db))


@pytest.mark.asyncio
async def test_create_job_no_rider(db_session):
    operator = await _create_operator(db_session)
    service = _job_service(db_session)
    payload = JobCreate(
        pickup_address="10 Allen Ave, Ikeja",
        dropoff_address="5 Bode Thomas, Surulere",
        parcel_description="Documents",
    )
    job = await service.create_job(payload, operator)
    assert job.status == JobStatus.created
    assert job.rider_id is None
    assert job.tracking_token


@pytest.mark.asyncio
async def test_create_job_with_rider(db_session):
    operator = await _create_operator(db_session)
    rider = await _create_rider(db_session, operator.id)
    service = _job_service(db_session)
    payload = JobCreate(
        pickup_address="10 Allen Ave, Ikeja",
        dropoff_address="5 Bode Thomas, Surulere",
        parcel_description="Phone",
        rider_id=rider.id,
    )
    job = await service.create_job(payload, operator)
    assert job.status == JobStatus.assigned
    assert job.rider_id == rider.id


@pytest.mark.asyncio
async def test_assign_rider(db_session):
    operator = await _create_operator(db_session)
    rider = await _create_rider(db_session, operator.id)
    service = _job_service(db_session)
    payload = JobCreate(
        pickup_address="10 Allen Ave, Ikeja",
        dropoff_address="5 Bode Thomas, Surulere",
        parcel_description="Clothes",
    )
    job = await service.create_job(payload, operator)
    assert job.status == JobStatus.created

    assigned = await service.assign_rider(job.id, rider.id, operator)
    assert assigned.status == JobStatus.assigned
    assert assigned.rider_id == rider.id


@pytest.mark.asyncio
async def test_rider_status_transitions(db_session):
    operator = await _create_operator(db_session)
    rider = await _create_rider(db_session, operator.id)
    service = _job_service(db_session)

    job = await service.create_job(
        JobCreate(
            pickup_address="A",
            dropoff_address="B",
            parcel_description="Box",
            rider_id=rider.id,
        ),
        operator,
    )

    job = await service.update_job_status(job.id, JobStatus.picked_up, rider)
    assert job.status == JobStatus.picked_up

    job = await service.update_job_status(job.id, JobStatus.in_transit, rider)
    assert job.status == JobStatus.in_transit

    job = await service.update_job_status(job.id, JobStatus.delivered, rider)
    assert job.status == JobStatus.delivered


@pytest.mark.asyncio
async def test_invalid_status_transition(db_session):
    operator = await _create_operator(db_session)
    rider = await _create_rider(db_session, operator.id)
    service = _job_service(db_session)

    job = await service.create_job(
        JobCreate(pickup_address="A", dropoff_address="B", parcel_description="Box", rider_id=rider.id),
        operator,
    )
    with pytest.raises(AppException) as exc_info:
        await service.update_job_status(job.id, JobStatus.delivered, rider)
    assert exc_info.value.code == "invalid_transition"


@pytest.mark.asyncio
async def test_tracking_by_token(db_session):
    operator = await _create_operator(db_session)
    service = _job_service(db_session)
    job = await service.create_job(
        JobCreate(pickup_address="A", dropoff_address="B", parcel_description="Bag"),
        operator,
    )

    tracking = TrackingService(
        job_repo=JobRepository(db_session),
        location_repo=LocationRepository(db_session),
        operator_repo=OperatorRepository(db_session),
        rider_repo=RiderRepository(db_session),
    )
    result = await tracking.get_by_token(job.tracking_token)
    assert result.job_id == job.id
    assert result.status == JobStatus.created
    assert result.last_lat is None
    assert result.last_lng is None


@pytest.mark.asyncio
async def test_tracking_invalid_token(db_session):
    tracking = TrackingService(
        job_repo=JobRepository(db_session),
        location_repo=LocationRepository(db_session),
        operator_repo=OperatorRepository(db_session),
        rider_repo=RiderRepository(db_session),
    )
    with pytest.raises(AppException) as exc_info:
        await tracking.get_by_token("not-a-real-token")
    assert exc_info.value.code == "not_found"
