from typing import Optional
import requests as req
import bs4

def fetch_metadata_from_isbn(isbn: str) -> Optional[dict]:
    """Fetch book metadata from openlibrary.org using ISBN"""

    base_data = req.get(f"https://openlibrary.org/isbn/{isbn}.json")
    if base_data.status_code != 200:
        return None

    data = base_data.json()
    title = data.get("title", "Unknown Title")
    authors = data.get("authors", [])
    author_names = []
    for author in authors:
        author_key = author.get("key")
        if author_key:
            author_data = req.get(f"https://openlibrary.org{author_key}.json")
            if author_data.status_code == 200:
                author_info = author_data.json()
                author_names.append(author_info.get("name", "Unknown Author"))

    return {
        "title": title,
        "author": ", ".join(author_names) if author_names else "Unknown Author",
        "cover_url": f"http://covers.openlibrary.org/b/isbn/{isbn}-L.jpg",
    }

