from pydantic import BaseModel, ConfigDict


class UserSettingsInfo(BaseModel):
    notify_sms: bool
    notify_push: bool
    notify_leave: bool
    notify_salary: bool
    notify_task: bool
    notify_attendance: bool
    two_factor_enabled: bool
    auto_logout: bool

    model_config = ConfigDict(from_attributes=True)


class UserSettingsUpdate(BaseModel):
    notify_sms: bool | None = None
    notify_push: bool | None = None
    notify_leave: bool | None = None
    notify_salary: bool | None = None
    notify_task: bool | None = None
    notify_attendance: bool | None = None
    two_factor_enabled: bool | None = None
    auto_logout: bool | None = None
