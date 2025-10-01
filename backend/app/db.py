from sqlmodel import SQLModel, create_engine, Session
import os

DATABASE_URL = "sqlite:///./book-lib.db"

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
