import os
import hashlib
from PIL import Image, ImageDraw


class BaseScanner:

    @staticmethod
    def generate_file_hash(file_path: str) -> str:
        with open(file_path, "rb") as f:
            file_hash = hashlib.md5(f.read()).hexdigest()
        return file_hash

    @staticmethod
    def get_file_size(file_path: str) -> int:
        return os.path.getsize(file_path)

    @staticmethod
    def create_placeholder_cover(title: str, cover_path: str):
        """Create a simple placeholder cover for books without covers"""

        img = Image.new("RGB", (200, 300), color=(240, 240, 240))
        d = ImageDraw.Draw(img)

        title_lines = []
        words = title.split()
        current_line = ""
        for word in words:
            test_line = current_line + " " + word if current_line else word
            if len(test_line) > 20:
                title_lines.append(current_line)
                current_line = word
            else:
                current_line = test_line
        if current_line:
            title_lines.append(current_line)

        y_position = 100
        for line in title_lines[:3]:
            d.text((10, y_position), line, fill=(0, 0, 0))
            y_position += 30

        img.save(cover_path, "JPEG")
        return cover_path
