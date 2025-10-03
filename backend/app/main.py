from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session
from pydantic import BaseModel
from .db import create_db_and_tables, get_session
from .models import Book
from .crud import get_books, update_book_progress, scan_books_directory

app = FastAPI(title="Localreads")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/covers", StaticFiles(directory="covers"), name="covers")


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def read_root():
    return {"message": "Welcome to Localreads"}


@app.get("/books/", response_model=list[Book])
def read_books(
    sort_by: str = "title",
    session: Session = Depends(get_session)
):
    return get_books(session, sort_by)


@app.get("/books/{book_id}", response_model=Book)
def read_book(book_id: int, session: Session = Depends(get_session)):
    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

class ProgressUpdate(BaseModel):
    progress: float

@app.patch("/books/{book_id}/progress")
def update_progress(
    book_id: int, 
    progress_update: ProgressUpdate,
    session: Session = Depends(get_session)
):
    updated_book = update_book_progress(session, book_id, progress_update.progress)
    if updated_book:
        return updated_book
    raise HTTPException(status_code=404, detail="Book not found")


@app.post("/scan/")
def scan_books(books_path: str = "./books", session: Session = Depends(get_session)):
    result = scan_books_directory(session, books_path)
    return result

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Localreads"}
