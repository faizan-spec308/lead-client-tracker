from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

import models
from auth import (
    create_access_token,
    verify_password,
    hash_password,
    get_user_by_email,
    get_current_user,
)
from db import init_db, engine
from deps import get_session
from schemas import ContactCreate, ContactRead, ContactUpdate, ClientRead


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

    # Create default admin if none exists
    with Session(engine) as session:
        admin_email = "admin@example.com"
        admin_password = "admin123"  # change this later

        existing = get_user_by_email(session, admin_email)
        if not existing:
            admin = models.User(
                email=admin_email,
                hashed_password=hash_password(admin_password),
            )
            session.add(admin)
            session.commit()

    

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/leads", response_model=ContactRead)
def create_lead(
    payload: ContactCreate,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    contact = models.Contact(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
    )
    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact

@app.get("/leads", response_model=list[ContactRead])
def get_leads(
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    leads = session.exec(select(models.Contact)).all()
    return leads


@app.post("/auth/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    # OAuth2PasswordRequestForm uses `username`; we treat it as email
    user = get_user_by_email(session, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


from fastapi import HTTPException, Depends
from sqlmodel import Session
import models
from deps import get_session
from schemas import ContactUpdate, ContactRead
from auth import get_current_user

@app.put("/leads/{id}", response_model=ContactRead)
def update_lead(
    id: int,
    payload: ContactUpdate,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    contact = session.get(models.Contact, id)
    if not contact:
        raise HTTPException(status_code=404, detail="Lead not found")

    data = payload.model_dump(exclude_unset=True)

    # optional: minimal validation
    if "email" in data and not data["email"]:
        raise HTTPException(status_code=400, detail="Email cannot be empty")
    if "name" in data and not data["name"]:
        raise HTTPException(status_code=400, detail="Name cannot be empty")

    for key, value in data.items():
        setattr(contact, key, value)

    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact



@app.delete("/leads/{id}")
def delete_lead(
    id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    contact = session.get(models.Contact, id)
    if not contact:
        raise HTTPException(status_code=404, detail="Lead not found")

    session.delete(contact)
    session.commit()
    return {"message": f"Lead {id} deleted"}

@app.get("/clients", response_model=list[ClientRead])
def get_clients(
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    return session.exec(select(models.Client)).all()

@app.post("/leads/{id}/convert", response_model=ClientRead)
def convert_lead_to_client(
    id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    lead = session.get(models.Contact, id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.status == "Converted":
        raise HTTPException(status_code=400, detail="Lead already converted")

    # Optional extra guard: prevent creating multiple clients from same lead
    existing_client = session.exec(
        select(models.Client).where(models.Client.source_lead_id == id)
    ).first()
    if existing_client:
        raise HTTPException(status_code=400, detail="Client already exists for this lead")

    client = models.Client(
        name=lead.name,
        email=lead.email,
        phone=lead.phone,
        source_lead_id=lead.id,
    )

    lead.status = "Converted"

    session.add(client)
    session.add(lead)
    session.commit()
    session.refresh(client)
    return client


