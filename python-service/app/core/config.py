from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Delivra"
    database_url: str = "sqlite+aiosqlite:///./delivra.db"

    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 hours

    # Base64-encoded Firebase service account JSON
    firebase_service_account_b64: str = ""

    # Twilio WhatsApp
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_whatsapp_from: str = "+14155238886"

    # Public base URL — used in tracking links sent to customers
    app_base_url: str = "http://localhost:3000"

    # Comma-separated extra origins for CORS (production domains)
    allowed_origins: str = ""

    # Paystack
    paystack_secret_key: str = ""
    paystack_public_key: str = ""

    # Resend email
    resend_api_key: str = ""
    resend_from_email: str = ""

    # Cloudflare R2 (S3-compatible object storage)
    cloudflare_r2_account_id: str = ""
    cloudflare_r2_access_key_id: str = ""
    cloudflare_r2_secret_access_key: str = ""
    cloudflare_r2_bucket_name: str = "fleeto-assets"
    cloudflare_r2_public_url: str = ""  # e.g. https://pub-xxxx.r2.dev

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
