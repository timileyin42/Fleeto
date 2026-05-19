from pydantic import BaseModel


class NotificationPrefs(BaseModel):
    new_jobs: bool
    status_updates: bool
    payments: bool

    model_config = {"from_attributes": True}


class NotificationPrefsUpdate(BaseModel):
    new_jobs: bool
    status_updates: bool
    payments: bool
