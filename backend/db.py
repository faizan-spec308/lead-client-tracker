import time
from sqlmodel import SQLModel, create_engine
from sqlalchemy.exc import OperationalError

DATABASE_URL = "postgresql://user:pass@db:5432/tracker"
engine = create_engine(DATABASE_URL, echo=True)

def init_db(retries: int = 30, delay: float = 1.0):
    for attempt in range(1, retries + 1):
        try:
            SQLModel.metadata.create_all(engine)
            print("? Database initialized (tables created if missing).")
            return
        except OperationalError as e:
            print(f"? DB not ready yet (attempt {attempt}/{retries})... {e}")
            time.sleep(delay)

    raise RuntimeError("? Database was not ready after retries.")
