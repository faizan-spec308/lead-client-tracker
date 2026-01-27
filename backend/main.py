from fastapi import FastAPI
from db import init_db
import models

app = FastAPI()

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"status": "ok"}
