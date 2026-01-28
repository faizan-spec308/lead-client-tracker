from fastapi import FastAPI, Depends
from sqlmodel import Session, select

import models
from db import init_db
from deps import get_session
from schemas import ContactCreate, ContactRead

app = FastAPI()

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/leads", response_model=ContactRead)
def create_lead(payload: ContactCreate, session: Session = Depends(get_session)):
    contact = models.Contact(
        name=payload.name,
        email=payload.email,
        phone=payload.phone
    )
    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact

@app.get("/leads", response_model=list[ContactRead])
def get_leads(session: Session = Depends(get_session)):
    leads = session.exec(select(models.Contact)).all()
    return leads
