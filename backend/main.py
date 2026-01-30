from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

import models
from db import init_db
from deps import get_session
from schemas import ContactCreate, ContactRead, ContactUpdate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

@app.put("/leads/{id}", response_model=ContactRead)
def update_lead(id: int, payload: ContactUpdate, session: Session = Depends(get_session)):
    contact = session.get(models.Contact, id)
    if not contact:
        raise HTTPException(status_code=404, detail="Lead not found")

    if payload.name is not None:
        contact.name = payload.name
    if payload.email is not None:
        contact.email = payload.email
    if payload.phone is not None:
        contact.phone = payload.phone
    if payload.status is not None:
        contact.status = payload.status

    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact

@app.delete("/leads/{id}")
def delete_lead(id: int, session: Session = Depends(get_session)):
    contact = session.get(models.Contact, id)
    if not contact:
        raise HTTPException(status_code=404, detail="Lead not found")

    session.delete(contact)
    session.commit()
    return {"message": f"Lead {id} deleted"}
