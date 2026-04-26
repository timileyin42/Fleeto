from __future__ import annotations

import base64
import json

import firebase_admin
from firebase_admin import auth, credentials

from app.core.config import settings

_app: firebase_admin.App | None = None


def _get_app() -> firebase_admin.App:
    global _app
    if _app is not None:
        return _app

    if not settings.firebase_service_account_b64:
        raise RuntimeError(
            "FIREBASE_SERVICE_ACCOUNT_B64 is not set. "
            "Run: base64 -i <service-account>.json | tr -d '\\n' "
            "and add the result to your .env file."
        )

    account_info = json.loads(base64.b64decode(settings.firebase_service_account_b64))
    cred = credentials.Certificate(account_info)
    _app = firebase_admin.initialize_app(cred)
    return _app


def verify_firebase_token(id_token: str) -> dict:
    _get_app()
    return auth.verify_id_token(id_token)
