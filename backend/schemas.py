from pydantic import BaseModel

class ContactCreate(BaseModel):
    name: str
    email: str
    phone: str

class ContactRead(ContactCreate):
    id: int
    status: str
