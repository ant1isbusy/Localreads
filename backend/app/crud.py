from sqlmodel import Session, select
from .models import Book, BookStatus
from typing import List, Optional
from .scanners import EPUBScanner, PDFScanner
import os


def create_book(session: Session, book_data: dict) -> Book:
    db_book = Book(**book_data)
    session.add(db_book)
    session.commit()
    session.refresh(db_book)
    return db_book


def get_books(session: Session, skip: int = 0, limit: int = 100) -> List[Book]:
    statement = select(Book).offset(skip).limit(limit)
    results = session.exec(statement)
    return list(results.all())


def get_book_by_id(session: Session, book_id: int) -> Optional[Book]:
    return session.get(Book, book_id)


def update_book_progress(
    session: Session, book_id: int, progress: float, current_page: int
) -> Optional[Book]:
    book = session.get(Book, book_id)
    if book:
        book.progress = progress
        book.current_page = current_page
        book.status = (
            BookStatus.READING
            if progress > 0 and progress < 1.0
            else BookStatus.COMPLETED if progress >= 1.0 else BookStatus.UNREAD
        )
        session.add(book)
        session.commit()
        session.refresh(book)
    return book


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
        "message": f"Scanning completed",
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
    """Process a single EPUB file and return book data"""
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
        print(f"Error processing EPUB {file_path}: {e}")
        return None
