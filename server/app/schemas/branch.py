from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class BranchCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    latitude: float = Field(..., ge=-90, le=90, examples=[41.311081])
    longitude: float = Field(..., ge=-180, le=180, examples=[69.240562])
    radius_meters: int = Field(default=150, ge=10, le=5000)

class BranchUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=128)
    latitude: float | None = Field(None, ge=-90, le=90, examples=[41.311081])
    longitude: float | None = Field(None, ge=-180, le=180, examples=[69.240562])
    radius_meters: int | None = Field(None, ge=10, le=5000)
    is_active: bool | None = None


class BranchInfo(BaseModel):
    id: UUID
    name: str
    latitude: float
    longitude: float
    radius_meters: int
    leader_id: UUID
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
