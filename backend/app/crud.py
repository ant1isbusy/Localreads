from sqlmodel import Session, select
from .models import Book, BookStatus, BookVisibility, Collection, BookCollection
from typing import List, Optional
from .scanners import EPUBScanner, PDFScanner
from datetime import datetime
import os
from .utils import fetch_metadata_from_isbn


def create_book(session: Session, book_data: dict) -> Book:
    db_book = Book(**book_data)
    session.add(db_book)
    session.commit()
    session.refresh(db_book)
    return db_book


def get_collections_db(session: Session):
    statement = select(Collection)
    collections = session.exec(statement).all()
    return collections


def create_collection_db(session: Session, collection_data: dict) -> dict:
    try:
        db_collection = Collection(**collection_data)
        session.add(db_collection)
        session.commit()
        session.refresh(db_collection)
        return db_collection
    except Exception as e:
        session.rollback()
        print(f"Error creating collection: {str(e)}")
        raise


def delete_collection_db(session: Session, collection_id: int) -> bool:
    try:
        collection = session.get(Collection, collection_id)
        if collection:
            session.delete(collection)
            session.commit()
            return True
        return False
    except Exception as e:
        session.rollback()
        print(f"Error deleting collection: {str(e)}")
        raise


def add_book_to_collection_db(
    session: Session, book_id: int, collection_id: int
) -> BookCollection:
    try:
        book = session.get(Book, book_id)
        collection = session.get(Collection, collection_id)

        if not book or not collection:
            raise ValueError("Book or Collection not found")

        existing = session.exec(
            select(BookCollection)
            .where(BookCollection.book_id == book_id)
            .where(BookCollection.collection_id == collection_id)
        ).first()

        if existing:
            return existing

        book_collection = BookCollection(book_id=book_id, collection_id=collection_id)
        session.add(book_collection)
        session.commit()
        session.refresh(book_collection)

        print(f"Added book {book_id} to collection {collection_id}")
        return book_collection
    except Exception as e:
        session.rollback()
        print(f"Error adding book to collection: {str(e)}")
        raise


def remove_book_from_collection_db(
    session: Session, book_id: int, collection_id: int
) -> bool:
    try:
        book_collection = session.exec(
            select(BookCollection)
            .where(BookCollection.book_id == book_id)
            .where(BookCollection.collection_id == collection_id)
        ).first()

        if book_collection:
            session.delete(book_collection)
            session.commit()
            return True
        return False
    except Exception as e:
        session.rollback()
        print(f"Error removing book from collection: {str(e)}")
        raise


def get_collection_with_books_db(session: Session, collection_id: int):
    try:
        books = session.exec(
            select(Book)
            .join(BookCollection, Book.id == BookCollection.book_id)
            .where(BookCollection.collection_id == collection_id)
        ).all()
        return books

    except Exception as e:
        print(f"Error getting collection with books: {str(e)}")
        raise


def get_books(session: Session, sort_by: str = "title"):
    statement = select(Book)
    if sort_by == "title":
        statement = statement.order_by(Book.title)
    elif sort_by == "progress":
        statement = statement.order_by(Book.progress.desc())

    books = session.exec(statement).all()

    for book in books:
        _ = book.collections  # This triggers lazy loading

    return books


def get_book_by_id(session: Session, book_id: int) -> Optional[Book]:
    book = session.get(Book, book_id)
    if book:
        _ = book.collections  # Load collections
    return book


def change_visibility(session: Session, book_id: int):
    book = session.get(Book, book_id)
    if book:
        vis = BookVisibility.HIDDEN
        if book.visibility == BookVisibility.HIDDEN:
            vis = BookVisibility.VISIBLE
        book.visibility = vis
        session.add(book)
        session.commit()
        session.refresh(book)
        return book
    return None


def update_book_progress(session: Session, book_id: int, progress: float):
    book = session.get(Book, book_id)
    if book:
        book.progress = max(0.0, min(1.0, progress))
        if progress == 0.0:
            book.status = BookStatus.UNREAD
        elif progress < 1.0:
            book.status = BookStatus.READING
        else:
            book.status = BookStatus.FINISHED

        book.last_updated = datetime.now()
        session.add(book)
        session.commit()
        session.refresh(book)
        return book
    return None


def update_book_rating_and_review(
    session: Session, book_id: int, rating_stars: int, review: Optional[str]
):
    book = session.get(Book, book_id)
    if book:
        book.rating_stars = max(0, min(5, rating_stars))
        book.review = review
        book.last_updated = datetime.now()
        session.add(book)
        session.commit()
        session.refresh(book)
        return book
    return None


def scan_books_directory(session: Session, books_path: str = "./books") -> dict:
    os.makedirs("covers", exist_ok=True)
    scanned_files = 0
    new_books = 0
    errors = 0

    try:
        for filename in os.listdir(books_path):
            file_path = os.path.join(books_path, filename)

            if not os.path.isfile(file_path):
                continue

            scanned_files += 1
            existing_book = session.exec(
                select(Book).where(Book.file_path == file_path)
            ).first()

            if existing_book:
                continue

            if filename.lower().endswith(".epub"):
                book_data = process_epub_file(file_path)
            elif filename.lower().endswith(".pdf"):
                book_data = process_pdf_file(file_path)
            else:
                continue

            if book_data:
                create_book(session, book_data)
                new_books += 1
            else:
                errors += 1

    except Exception as e:
        return {
            "status": "error",
            "message": f"Scanning failed: {str(e)}",
            "scanned_files": scanned_files,
            "new_books": new_books,
            "errors": errors,
        }

    return {
        "status": "success",
        "message": "Scanning completed",
        "scanned_files": scanned_files,
        "new_books": new_books,
        "errors": errors,
    }


def process_epub_file(file_path: str) -> Optional[dict]:
    """Process a single EPUB file and return book data"""
    try:
        metadata = EPUBScanner.extract_metadata(file_path)

        return {
            "title": metadata["title"],
            "author": metadata["author"],
            "file_path": file_path,
            "file_type": "epub",
            "file_size": EPUBScanner.get_file_size(file_path),
            "pages": metadata["pages"],
            "cover_path": metadata["cover_path"],
            "progress": 0.0,
            "current_page": 0,
            "status": BookStatus.UNREAD,
        }
    except Exception as e:
        print(f"Error processing EPUB {file_path}: {e}")
        return None


def process_pdf_file(file_path: str) -> Optional[dict]:
    """Process a single PDF file and return book data"""
    try:
        metadata = PDFScanner.extract_metadata(file_path)

        return {
            "title": metadata["title"],
            "author": metadata["author"],
            "file_path": file_path,
            "file_type": "pdf",
            "file_size": PDFScanner.get_file_size(file_path),
            "pages": metadata["pages"],
            "cover_path": metadata["cover_path"],
            "progress": 0.0,
            "current_page": 0,
            "status": BookStatus.UNREAD,
        }
    except Exception as e:
        print(f"Error processing PDF {file_path}: {e}")
        return None


def add_book_from_isbn(isbn: str, session: Session) -> Optional[Book]:
    file_path = f"ISBN:{isbn}"
    existing_book = session.exec(
        select(Book).where(Book.file_path == file_path)
    ).first()

    if existing_book:
        return existing_book

    metadata = fetch_metadata_from_isbn(isbn)
    if not metadata:
        return None

    book_data = {
        "title": metadata["title"],
        "author": metadata["author"],
        "file_path": f"ISBN:{isbn}",
        "file_type": "ISBN",
        "file_size": 0,
        "pages": metadata.get("pages"),
        "cover_path": metadata["cover_url"],
        "progress": 0.0,
        "current_page": 0,
        "status": BookStatus.UNREAD,
    }

    return create_book(session, book_data)
