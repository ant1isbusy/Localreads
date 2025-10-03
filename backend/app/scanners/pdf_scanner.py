import os
from typing import Dict, Optional
from .base_scanner import BaseScanner
import pymupdf


class PDFScanner(BaseScanner):
    @classmethod
    def extract_metadata(cls, file_path: str) -> Dict:
        """Extract metadata from PDF file"""
        try:
            doc = pymupdf.open(file_path)
            metadata = {
                "title": os.path.splitext(os.path.basename(file_path))[0],
                "author": "-",
                "pages": len(doc),
                "cover_path": None,
            }

            page = doc.load_page(0)
            pix = page.get_pixmap(matrix=pymupdf.Matrix(0.7, 0.7))
            cover_filename = f"cover_{cls.generate_file_hash(file_path)}.jpg"
            pix.save(os.path.join("covers", cover_filename))
            metadata["cover_path"] = os.path.join("covers", cover_filename)

            return metadata

        except Exception as e:
            print(f"Error extracting metadata from PDF: {e}")
            return {
                "title": os.path.splitext(os.path.basename(file_path))[0],
                "author": "Unknown Author",
                "pages": None,
                "cover_path": None,
            }
