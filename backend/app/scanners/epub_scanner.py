import os
import ebooklib
from ebooklib import epub
from PIL import Image
import io
from typing import Dict, Optional
from .base_scanner import BaseScanner


class EPUBScanner(BaseScanner):
    """Scanner for EPUB files"""

    @classmethod
    def extract_metadata(cls, file_path: str) -> Dict:
        """Extract metadata from EPUB file"""
        try:
            book = epub.read_epub(file_path)
            metadata = {
                "title": os.path.splitext(os.path.basename(file_path))[0],
                "author": "Unknown Author",
                "pages": None,
                "cover_path": None,
            }

            if hasattr(book, "metadata"):
                print("IN HERE!")
                print(book.metadata)
                if book.metadata.get("DC", {}).get("title"):
                    metadata["title"] = book.metadata["DC"]["title"][0]

                if book.metadata.get("DC", {}).get("creator"):
                    metadata["author"] = book.metadata["DC"]["creator"][0]

            else:
                print("NO METADATA ATTRIBUTE")

            cover_path = cls.extract_cover(book, file_path)
            if cover_path:
                metadata["cover_path"] = cover_path
            else:
                # Create placeholder cover
                cover_filename = f"cover_{cls.generate_file_hash(file_path)}.jpg"
                cover_path = os.path.join("covers", cover_filename)
                metadata["cover_path"] = cls.create_placeholder_cover(
                    metadata["title"], cover_path
                )

            return metadata

        except Exception as e:
            print(f"Error reading EPUB {file_path}: {e}")
            return {
                "title": os.path.splitext(os.path.basename(file_path))[0],
                "author": "Unknown Author",
                "pages": None,
                "cover_path": None,
            }

    @classmethod
    def extract_cover(cls, book: epub.EpubBook, file_path: str) -> Optional[str]:
        """Extract cover image from EPUB"""
        try:
            for item in book.get_items():
                if item.get_type() == ebooklib.ITEM_COVER:
                    cover_data = item.get_content()

                    cover_filename = f"cover_{cls.generate_file_hash(file_path)}.jpg"
                    cover_path = os.path.join("covers", cover_filename)

                    image = Image.open(io.BytesIO(cover_data))
                    image = image.convert("RGB")
                    image.save(cover_path, "JPEG")
                    return cover_path

                if item.get_type() == ebooklib.ITEM_IMAGE:
                    if "cover" in item.file_name.lower():
                        cover_data = item.get_content()
                        cover_filename = (
                            f"cover_{cls.generate_file_hash(file_path)}.jpg"
                        )
                        cover_path = os.path.join("covers", cover_filename)

                        image = Image.open(io.BytesIO(cover_data))
                        image = image.convert("RGB")
                        image.save(cover_path, "JPEG")
                        return cover_path

            return None

        except Exception as e:
            print(f"Error extracting cover from {file_path}: {e}")
            return None
