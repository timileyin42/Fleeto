from __future__ import annotations

import asyncio
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send_sync(customer_phone: str, tracking_token: str, operator_name: str) -> None:
    """Sync Twilio call — run inside a thread so it doesn't block the event loop."""
    from twilio.rest import Client
    from twilio.base.exceptions import TwilioRestException

    tracking_url = f"{settings.app_base_url}/tracking/{tracking_token}"

    phone = customer_phone.strip().replace(" ", "").replace("-", "")
    if not phone.startswith("+"):
        phone = "+" + phone

    body = (
        f"Hi! Your delivery from *{operator_name}* is confirmed. 🛵\n\n"
        f"Track your package live here:\n{tracking_url}\n\n"
        f"_Powered by Fleeto_"
    )

    try:
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        message = client.messages.create(
            from_=f"whatsapp:{settings.twilio_whatsapp_from}",
            body=body,
            to=f"whatsapp:{phone}",
        )
        logger.info("WhatsApp sent to %s — SID: %s", phone, message.sid)
    except TwilioRestException as exc:
        logger.warning("Twilio error for %s: %s", phone, exc)
    except Exception as exc:
        logger.error("WhatsApp send failed for %s: %s", phone, exc)


async def send_tracking_link(customer_phone: str, tracking_token: str, operator_name: str) -> None:
    """
    Fire-and-forget async wrapper.
    Twilio SDK is synchronous so we run it in a thread pool.
    Never raises — a failure logs silently and never blocks job creation.
    """
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        logger.warning("Twilio credentials not set — skipping WhatsApp notification")
        return

    await asyncio.to_thread(_send_sync, customer_phone, tracking_token, operator_name)
