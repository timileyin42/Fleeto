import pytest

from app.repositories.briefing_repo import BriefingRepository
from app.schemas.briefing import BriefingCreate
from app.services.briefing_service import BriefingService


@pytest.mark.asyncio
async def test_create_and_fetch_briefing(db_session):
    service = BriefingService(BriefingRepository(db_session))
    payload = BriefingCreate(
        companyName="Acme Corp",
        ticker="acme",
        summary="Strong quarter with revenue growth.",
        recommendation="BUY",
        keyPoints=["Revenue increased", "Operating margin improved"],
        risks=["FX volatility"],
        metrics=[{"name": "Revenue", "value": "102.4", "unit": "USDm"}],
    )

    created = await service.create_briefing(payload)
    fetched = await service.get_briefing(created.id)

    assert fetched.company_name == "Acme Corp"
    assert fetched.ticker == "ACME"
    assert len(fetched.key_points) == 2
