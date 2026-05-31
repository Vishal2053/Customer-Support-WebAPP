"""
Utility functions for common operations
"""
import os
from datetime import datetime
from typing import Optional


def validate_email(email: str) -> bool:
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_url(url: str) -> bool:
    """Validate URL format"""
    import re
    pattern = r'^https?://[^\s/$.?#].[^\s]*$'
    return re.match(pattern, url, re.IGNORECASE) is not None


def get_file_extension(filename: str) -> str:
    """Get file extension"""
    return os.path.splitext(filename)[1].lower()


def allowed_file(filename: str, allowed_extensions: set) -> bool:
    """Check if file extension is allowed"""
    return get_file_extension(filename).lstrip('.') in allowed_extensions


def format_timestamp(dt: datetime) -> str:
    """Format datetime to ISO format"""
    return dt.isoformat()


def parse_timestamp(timestamp_str: str) -> Optional[datetime]:
    """Parse ISO format timestamp"""
    try:
        return datetime.fromisoformat(timestamp_str)
    except ValueError:
        return None


def truncate_text(text: str, max_length: int = 500) -> str:
    """Truncate text to max length"""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def get_human_readable_size(bytes_size: int) -> str:
    """Convert bytes to human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.2f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.2f} TB"
