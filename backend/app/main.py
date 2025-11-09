from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session
from pydantic import BaseModel
from .db import create_db_and_tables, get_session
from .models import Book
from .crud import (
    get_books,
    update_book_progress,
    scan_books_directory,
    update_book_rating_and_review,
    change_visibility,
    get_collections_db,
    create_collection_db,
    delete_collection_db,
    add_book_to_collection_db,
    remove_book_from_collection_db,
    get_collection_with_books_db
)

app = FastAPI(title="Localreads")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.0.118:3000",
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
def read_books(sort_by: str = "title", session: Session = Depends(get_session)):
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
    session: Session = Depends(get_session),
):
    updated_book = update_book_progress(session, book_id, progress_update.progress)
    if updated_book:
        return updated_book
    raise HTTPException(status_code=404, detail="Book not found")


class RatingReviewUpdate(BaseModel):
    rating_stars: int
    review: str | None = None


@app.patch("/books/{book_id}/rating_review")
def update_rating_review(
    book_id: int,
    rating_review_update: RatingReviewUpdate,
    session: Session = Depends(get_session),
):
    updated_book = update_book_rating_and_review(
        session, book_id, rating_review_update.rating_stars, rating_review_update.review
    )
    if updated_book:
        return updated_book
    raise HTTPException(status_code=404, detail="Book not found")


@app.post("/scan/")
def scan_books(
    books_path: str = "/home/antoine/books", session: Session = Depends(get_session)
):
    result = scan_books_directory(session, books_path)
    return result


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Localreads"}


@app.patch("/books/{book_id}/visibility")
def remove_book(book_id: int, session: Session = Depends(get_session)):
    result = change_visibility(session, book_id)
    return result


class CollectionData(BaseModel):
    name: str
    description: str


@app.post("/collections/")
async def create_collection(
    collection: CollectionData,
    session: Session = Depends(get_session)
):
    try:
        collection_dict = collection.model_dump(exclude_unset=True)
        new_collection = create_collection_db(session, collection_dict)
        return new_collection
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/collections/")
def get_collections(session: Session = Depends(get_session)):
    return get_collections_db(session)


@app.get("/collections/{collection_id}")
def get_collection(collection_id: int, session: Session = Depends(get_session)):
    collection = get_collection_with_books_db(session, collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return collection


@app.delete("/collections/{collection_id}")
def delete_collection(collection_id: int, session: Session = Depends(get_session)):
    try:
        success = delete_collection_db(session, collection_id)
        if success:
            return {"message": "Collection deleted successfully"}
        raise HTTPException(status_code=404, detail="Collection not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class AddBookToCollectionData(BaseModel):
    book_id: int


@app.post("/collections/{collection_id}/books")
def add_book_to_collection(
    collection_id: int,
    data: AddBookToCollectionData,
    session: Session = Depends(get_session)
):
    try:
        add_book_to_collection_db(session, data.book_id, collection_id)
        return {"message": "Book added to collection successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/collections/{collection_id}/books/{book_id}")
def remove_book_from_collection(
    collection_id: int,
    book_id: int,
    session: Session = Depends(get_session)
):
    try:
        success = remove_book_from_collection_db(session, book_id, collection_id)
        if success:
            return {"message": "Book removed from collection successfully"}
        raise HTTPException(status_code=404, detail="Book not in collection")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))