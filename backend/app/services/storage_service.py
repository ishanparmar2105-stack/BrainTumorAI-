"""File storage service for managing uploads."""
import os
from uuid import uuid4

from fastapi import UploadFile, HTTPException

from app.core.config import settings


class StorageService:
    """Service for managing file uploads and storage."""

    def __init__(self):
        """Initialize storage directories."""
        os.makedirs(os.path.join(settings.UPLOAD_DIR, 'mri'), exist_ok=True)
        os.makedirs(os.path.join(settings.UPLOAD_DIR, 'gradcam'), exist_ok=True)

    async def save_upload(self, file: UploadFile, category: str = 'mri') -> str:
        """Save an uploaded file and return the relative path."""
        safe_filename = self.get_safe_filename(file.filename or 'upload.png')
        file_path = os.path.join(settings.UPLOAD_DIR, category, safe_filename)

        content = await file.read()
        with open(file_path, 'wb') as f:
            f.write(content)

        return file_path

    def delete_file(self, path: str) -> None:
        """Delete a file if it exists."""
        if path and os.path.exists(path):
            os.remove(path)

    async def validate_image(self, file: UploadFile) -> None:
        """Validate that the uploaded file is a valid image."""
        if not file.filename:
            raise HTTPException(status_code=400, detail='No filename provided')

        # Check file extension
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ('.jpg', '.jpeg', '.png'):
            raise HTTPException(
                status_code=400,
                detail=f'Invalid file type: {ext}. Allowed: .jpg, .jpeg, .png'
            )

        # Check content type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail='File must be an image'
            )

        # Check file size
        content = await file.read()
        if len(content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f'File too large. Maximum size: {settings.MAX_FILE_SIZE / 1024 / 1024:.1f}MB'
            )

        # Reset file position
        await file.seek(0)

    def get_safe_filename(self, original_filename: str) -> str:
        """Generate a safe unique filename preserving the original extension."""
        ext = os.path.splitext(original_filename)[1].lower()
        return f'{uuid4().hex}{ext}'


storage_service = StorageService()
