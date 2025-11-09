from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum

class BookStatus(str, Enum):
    UNREAD = "unread"
    READING = "reading"
    FINISHED = "finished"

class BookVisibility(str, Enum):
    HIDDEN = "hidden"
    VISIBLE = "visible"

class BookCollection(SQLModel, table=True):
    book_id: Optional[int] = Field(default=None, foreign_key="book.id", primary_key=True)
    collection_id: Optional[int] = Field(default=None, foreign_key="collection.id", primary_key=True)
    added_at: datetime = Field(default_factory=datetime.now)

class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    author: str = "Unknown Author"
    file_path: str
    file_type: str
    file_size: int
    pages: Optional[int] = None
    cover_path: Optional[str] = None
    progress: float = 0.0
    current_page: int = 0
    rating_stars: int = 0
    review: Optional[str] = None
    status: BookStatus = BookStatus.UNREAD
    visibility: BookVisibility = BookVisibility.VISIBLE
    last_updated: datetime = Field(default_factory=datetime.now)
    created_at: datetime = Field(default_factory=datetime.now)
    
    collections: List["Collection"] = Relationship(
        back_populates="books",
        link_model=BookCollection
    )

class Collection(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    
    books: List[Book] = Relationship(
        back_populates="collections",
        link_model=BookCollection
    )