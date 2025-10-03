from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class BookStatus(str, Enum):
    UNREAD = "unread"
    READING = "reading"
    COMPLETED = "completed"


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
    status: BookStatus = BookStatus.UNREAD
    last_updated: datetime = Field(default_factory=datetime.now)
    created_at: datetime = Field(default_factory=datetime.now)
