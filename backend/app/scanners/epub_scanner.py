import os
from ebooklib import epub
import io
from typing import Dict, Optional
from .base_scanner import BaseScanner
from PIL import Image
import re
from xml.dom import minidom
import zipfile


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

            cover_path = cls.extract_cover(file_path)
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
    def extract_cover(cls, file_path: str) -> Optional[str]:
        """Extract cover image from EPUB using multiple fallback methods"""
        try:
            with zipfile.ZipFile(file_path, "r") as zf:
                # Try multiple extraction approaches
                cover_image_path = (
                    cls._find_cover_in_metadata(zf) or
                    cls._find_cover_in_navigation(zf) or
                    cls._find_cover_by_heuristics(zf)
                )
                
                if cover_image_path:
                    return cls._save_cover_image(zf, cover_image_path, file_path)
            
            return None

        except Exception as e:
            print(f"Error extracting cover from {file_path}: {e}")
            return None

    @classmethod
    def _parse_content_opf(cls, zf):
        """Parse the EPUB's content.opf file and return path and DOM"""
        try:
            container_data = zf.read("META-INF/container.xml")
            container_dom = minidom.parseString(container_data)
            
            rootfiles = container_dom.getElementsByTagName("rootfile")
            if not rootfiles:
                return None, None
                
            opf_path = rootfiles[0].getAttribute("full-path")
            opf_data = zf.read(opf_path)
            opf_dom = minidom.parseString(opf_data)
            
            return opf_path, opf_dom
        except Exception as e:
            print(f"Error parsing content.opf: {e}")
            return None, None

    @classmethod
    def _find_cover_in_metadata(cls, zf) -> Optional[str]:
        """Look for cover reference in OPF metadata and manifest"""
        try:
            opf_path, opf_dom = cls._parse_content_opf(zf)
            if not opf_dom:
                return None
            
            # Search for cover reference in metadata
            cover_ref = None
            for meta_tag in opf_dom.getElementsByTagName("meta"):
                if meta_tag.getAttribute("name") == "cover":
                    cover_ref = meta_tag.getAttribute("content")
                    break
            
            # Look through manifest items for the cover
            manifest_items = opf_dom.getElementsByTagName("manifest")
            if not manifest_items:
                return None
                
            for item in manifest_items[0].getElementsByTagName("item"):
                item_id = item.getAttribute("id")
                item_href = item.getAttribute("href")
                properties = item.getAttribute("properties")
                
                # Check if this item matches our cover criteria
                is_image = re.search(r'\.(jpe?g|png)$', item_href, re.IGNORECASE)
                matches_id = cover_ref and item_id == cover_ref
                has_cover_keyword = 'cover' in item_id.lower() or 'cover' in properties.lower()
                
                if is_image and (matches_id or has_cover_keyword):
                    opf_dir = os.path.dirname(opf_path)
                    full_path = os.path.join(opf_dir, item_href)
                    return os.path.normpath(full_path)
            
            return None
        except Exception as e:
            print(f"Error finding cover in metadata: {e}")
            return None

    @classmethod
    def _find_cover_in_navigation(cls, zf) -> Optional[str]:
        """Search for cover in guide/spine navigation elements"""
        try:
            opf_path, opf_dom = cls._parse_content_opf(zf)
            if not opf_dom:
                return None
            
            # Check guide references
            for guide_ref in opf_dom.getElementsByTagName("reference"):
                if guide_ref.getAttribute("type") == "cover":
                    ref_href = guide_ref.getAttribute("href")
                    opf_dir = os.path.dirname(opf_path)
                    cover_doc_path = os.path.normpath(os.path.join(opf_dir, ref_href))
                    
                    # Parse the referenced HTML/XHTML document
                    try:
                        doc_content = zf.read(cover_doc_path)
                        doc_dom = minidom.parseString(doc_content)
                        
                        # Find image elements
                        for img in doc_dom.getElementsByTagName("img"):
                            img_src = img.getAttribute("src")
                            if img_src:
                                doc_dir = os.path.dirname(cover_doc_path)
                                img_full_path = os.path.join(doc_dir, img_src)
                                return os.path.normpath(img_full_path)
                    except:
                        continue
            
            return None
        except Exception as e:
            print(f"Error finding cover in navigation: {e}")
            return None

    @classmethod
    def _find_cover_by_heuristics(cls, zf) -> Optional[str]:
        """Use filename patterns and file size to identify cover"""
        try:
            image_files = []
            cover_pattern = re.compile(r'cover', re.IGNORECASE)
            
            for file_info in zf.filelist:
                filename = file_info.filename
                
                # Check if it's an image file
                if re.search(r'\.(jpe?g|png)$', filename, re.IGNORECASE):
                    # Prioritize files with 'cover' in the name
                    if cover_pattern.search(filename):
                        return filename
                    
                    image_files.append(file_info)
            
            # Fallback: return the largest image file
            if image_files:
                largest = max(image_files, key=lambda f: f.file_size)
                return largest.filename
            
            return None
        except Exception as e:
            print(f"Error finding cover by heuristics: {e}")
            return None

    @classmethod
    def _save_cover_image(cls, zf, image_path_in_zip: str, epub_path: str) -> str:
        """Read image from ZIP and save to covers directory"""
        try:
            img_data = zf.read(image_path_in_zip)
            img = Image.open(io.BytesIO(img_data))
            
            # Handle CMYK images
            if img.mode == "CMYK":
                img = img.convert("RGB")
            
            # Generate output path
            cover_filename = f"cover_{cls.generate_file_hash(epub_path)}.jpg"
            output_path = os.path.join("covers", cover_filename)
            os.makedirs("covers", exist_ok=True)
            
            img.save(output_path, "JPEG")
            return output_path
            
        except Exception as e:
            print(f"Error saving cover image: {e}")
            return None