import uuid
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.exceptions import AppException
from app.repositories.briefing_repo import BriefingRepository
from app.services.formatter import BriefingFormatter

templates_dir = Path(__file__).resolve().parents[1] / "templates"
jinja_env = Environment(
    loader=FileSystemLoader(str(templates_dir)),
    autoescape=select_autoescape(["html", "xml"]),
)


class ReportService:
    def __init__(self, briefing_repo: BriefingRepository) -> None:
        self.briefing_repo = briefing_repo

    async def render_html_report(self, briefing_id: uuid.UUID) -> str:
        briefing = await self.briefing_repo.get_briefing(briefing_id)
        if not briefing:
            raise AppException(
                detail="Briefing not found",
                code="briefing_not_found",
                status_code=404,
            )

        template = jinja_env.get_template("briefing_report.html")
        return template.render(briefing=BriefingFormatter.to_template_payload(briefing))
