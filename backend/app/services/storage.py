from supabase import Client
from typing import BinaryIO
import uuid
from ..config import settings
from ..auth import supabase

BUCKET_NAME = "incident-attachments"


async def upload_file(file_content: BinaryIO, filename: str, incident_id: str) -> str:
    """Upload file to Supabase Storage and return the storage path."""
    
    # Generate unique filename
    file_extension = filename.split('.')[-1] if '.' in filename else ''
    unique_filename = f"{incident_id}/{uuid.uuid4()}.{file_extension}"
    
    try:
        # Upload to Supabase Storage
        response = supabase.storage.from_(BUCKET_NAME).upload(
            unique_filename,
            file_content,
            file_options={"content-type": "application/octet-stream"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(unique_filename)
        
        return public_url
    except Exception as e:
        raise Exception(f"Failed to upload file: {str(e)}")


async def delete_file(storage_path: str) -> bool:
    """Delete file from Supabase Storage."""
    
    try:
        # Extract path from URL
        path = storage_path.split(f"{BUCKET_NAME}/")[-1]
        
        supabase.storage.from_(BUCKET_NAME).remove([path])
        return True
    except Exception as e:
        print(f"Failed to delete file: {str(e)}")
        return False


async def get_signed_url(storage_path: str, expires_in: int = 3600) -> str:
    """Get a signed URL for private file access."""
    
    try:
        # Extract path from URL
        path = storage_path.split(f"{BUCKET_NAME}/")[-1]
        
        response = supabase.storage.from_(BUCKET_NAME).create_signed_url(path, expires_in)
        return response.get('signedURL', storage_path)
    except Exception:
        return storage_path
