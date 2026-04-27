from __future__ import annotations

import logging
from pathlib import Path

import resend
from jinja2 import Environment, FileSystemLoader

from app.core.config import settings

logger = logging.getLogger(__name__)

_TEMPLATE_DIR = Path(__file__).parent.parent / "templates" / "email"
_env = Environment(loader=FileSystemLoader(str(_TEMPLATE_DIR)), autoescape=True)


def _render(template_name: str, **ctx) -> str:
    return _env.get_template(template_name).render(**ctx)


def _send(to: str, subject: str, html: str) -> None:
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not set — skipping email to %s", to)
        return
    resend.api_key = settings.resend_api_key
    try:
        resend.Emails.send({
            "from": settings.resend_from_email,
            "to": [to],
            "subject": subject,
            "html": html,
        })
        logger.info("Email sent to %s — %s", to, subject)
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)


def send_welcome_email(operator_name: str, operator_email: str, dashboard_url: str) -> None:
    html = _render("welcome.html", operator_name=operator_name, dashboard_url=dashboard_url)
    _send(
        to=operator_email,
        subject="Welcome to Delivra — Your infrastructure is ready",
        html=html,
    )


def send_job_confirmation_email(
    customer_email: str,
    customer_name: str,
    job_id: str,
    pickup_address: str,
    dropoff_address: str,
    tracking_url: str,
    operator_name: str,
) -> None:
    html = _render(
        "job_confirmation.html",
        customer_name=customer_name,
        job_id=job_id,
        pickup_address=pickup_address,
        dropoff_address=dropoff_address,
        tracking_url=tracking_url,
        operator_name=operator_name,
    )
    _send(
        to=customer_email,
        subject=f"Delivery confirmed — Job {job_id}",
        html=html,
    )


def send_delivery_success_email(
    customer_email: str,
    customer_name: str,
    job_id: str,
    pickup_address: str,
    dropoff_address: str,
    operator_name: str,
    tracking_url: str,
) -> None:
    html = _render(
        "delivery_success.html",
        customer_name=customer_name,
        job_id=job_id,
        pickup_address=pickup_address,
        dropoff_address=dropoff_address,
        operator_name=operator_name,
        tracking_url=tracking_url,
    )
    _send(
        to=customer_email,
        subject=f"Your delivery is complete — Job {job_id}",
        html=html,
    )


def send_payment_success_email(
    operator_email: str,
    operator_name: str,
    plan_name: str,
    amount: str,
    reference: str,
    dashboard_url: str,
) -> None:
    html = _render(
        "payment_success.html",
        operator_name=operator_name,
        plan_name=plan_name,
        amount=amount,
        reference=reference,
        dashboard_url=dashboard_url,
    )
    _send(
        to=operator_email,
        subject=f"You're now on the {plan_name} plan — Delivra",
        html=html,
    )


def send_rider_credentials_email(
    rider_email: str,
    rider_name: str,
    operator_name: str,
    phone: str,
    password: str,
    login_url: str,
) -> None:
    html = _render(
        "rider_invite.html",
        rider_name=rider_name,
        operator_name=operator_name,
        phone=phone,
        password=password,
        login_url=login_url,
    )
    _send(
        to=rider_email,
        subject=f"You've been added to {operator_name}'s fleet on Delivra",
        html=html,
    )
