from sqlmodel import Session, select
from .models import Book, BookStatus
from typing import List, Optional, Sequence


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
