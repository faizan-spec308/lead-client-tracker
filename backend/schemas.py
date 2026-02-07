from pydantic import BaseModel
from typing import Optional

class ContactCreate(BaseModel):
    name: str
    email: str
    phone: str

class ContactRead(ContactCreate):
    id: int
    status: str

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    id: int
    email: str


class ClientRead(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None = None
    source_lead_id: int | None = None

