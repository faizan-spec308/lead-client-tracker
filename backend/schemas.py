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
