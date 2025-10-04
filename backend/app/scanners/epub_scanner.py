import os
from ebooklib import epub, ITEM_DOCUMENT, ITEM_IMAGE
import io
from typing import Dict, Optional
from .base_scanner import BaseScanner
from PIL import Image
from bs4 import BeautifulSoup


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
                dc_keys = ["http://purl.org/dc/elements/1.1/", "DC", "dc"]
                dc_meta = None
                for key in dc_keys:
                    if key in book.metadata:
                        dc_meta = book.metadata[key]
                        break

                if dc_meta:
                    if "title" in dc_meta and dc_meta["title"]:
                        title_val = dc_meta["title"][0]
                        metadata["title"] = (
                            title_val[0] if isinstance(title_val, tuple) else title_val
                        )

                    if "creator" in dc_meta and dc_meta["creator"]:
                        author_val = dc_meta["creator"][0]
                        metadata["author"] = (
                            author_val[0]
                            if isinstance(author_val, tuple)
                            else author_val
                        )

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
        """Extract cover image from EPUB (handles cover.xhtml and direct cover images)"""
        try:
            cover_item = None

            for item in book.get_items_of_type(ITEM_IMAGE):
                name = item.get_name()
                print(name)
                bn = os.path.splitext(os.path.basename(name))[0]
                bn = bn.lower()
                if bn == "cover" or "cover" in bn or "cvi" in bn:                    
                    cover_item = item
                    break

            if not cover_item:
                for item in book.get_items_of_type(ITEM_DOCUMENT):
                    if "cover" in item.get_name().lower() and item.get_name().endswith(
                        ".xhtml"
                    ):
                        soup = BeautifulSoup(item.get_content(), "html.parser")
                        img_tag = soup.find("img")
                        
                        if img_tag and img_tag.get("src"):
                            img_src = img_tag["src"]

                            # Resolve relative path
                            img_path = os.path.normpath(
                                os.path.join(os.path.dirname(item.get_name()), img_src)
                            )
                            cover_item = book.get_item_with_href(img_path)
                            break

            if not cover_item:
                images = list(book.get_items_of_type(ITEM_IMAGE))
                if images:
                    cover_item = images[0]

            if cover_item:
                image_data = cover_item.get_content()
                image = Image.open(io.BytesIO(image_data))
                cover_filename = f"cover_{cls.generate_file_hash(file_path)}.jpg"
                cover_path = os.path.join("covers", cover_filename)
                os.makedirs("covers", exist_ok=True)
                image.save(cover_path, "JPEG")
                return cover_path

            return None

        except Exception as e:
            print(f"Error extracting cover from {file_path}: {e}")
            return None
