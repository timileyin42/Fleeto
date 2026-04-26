import pytest

from app.repositories.briefing_repo import BriefingRepository
from app.schemas.briefing import BriefingCreate
from app.services.briefing_service import BriefingService
from app.services.report_service import ReportService


@pytest.mark.asyncio
async def test_render_report_html(db_session):
    briefing_service = BriefingService(BriefingRepository(db_session))
    report_service = ReportService(BriefingRepository(db_session))

    created = await briefing_service.create_briefing(
        BriefingCreate(
            companyName="Beta Inc",
            ticker="BETA",
            summary="Stable execution and steady margins.",
            recommendation="HOLD",
            keyPoints=["Cost control", "Stable churn"],
            risks=["Competitive pressure"],
            metrics=[{"name": "EBITDA", "value": "18.2", "unit": "%"}],
        ),
    )

    html = await report_service.render_html_report(created.id)

    assert "Beta Inc" in html
    assert "Recommendation: HOLD" in html
