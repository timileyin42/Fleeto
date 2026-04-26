from app.models.briefing import Briefing


class BriefingFormatter:
    @staticmethod
    def to_response_payload(briefing: Briefing) -> dict:
        sorted_points = sorted(briefing.points, key=lambda item: item.position)
        sorted_risks = sorted(briefing.risks, key=lambda item: item.position)
        sorted_metrics = sorted(briefing.metrics, key=lambda item: item.name.lower())

        return {
            "id": briefing.id,
            "companyName": briefing.company_name,
            "ticker": briefing.ticker,
            "summary": briefing.summary,
            "recommendation": briefing.recommendation,
            "keyPoints": [point.point_text for point in sorted_points],
            "risks": [risk.risk_text for risk in sorted_risks],
            "metrics": [
                {"name": metric.name, "value": metric.value, "unit": metric.unit}
                for metric in sorted_metrics
            ],
            "created_at": briefing.created_at,
        }

    @staticmethod
    def to_template_payload(briefing: Briefing) -> dict:
        payload = BriefingFormatter.to_response_payload(briefing)
        payload["created_at"] = briefing.created_at.strftime("%Y-%m-%d %H:%M UTC")
        return payload
