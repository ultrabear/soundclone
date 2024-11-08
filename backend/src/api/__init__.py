import sys
from pathlib import Path
from typing import TypedDict, NotRequired

root_dir = Path(__file__).parent.parent.parent.parent
sys.path.append(str(root_dir))

class ApiError(TypedDict):
    message: str
    errors: dict[str, str]

class Artist(TypedDict):
    id: int
    stage_name: str
    profile_image: NotRequired[str]
    first_release: NotRequired[str]
    biography: NotRequired[str]
    location: NotRequired[str]
    homepage: NotRequired[str]

class PostArtist(TypedDict):
    message: str
    artist: Artist

class SuccessResponse(TypedDict):
    message: str

from api.backend import (
    Id,
    IdAndTimestamps,
    RequiresAuth,
    NoPayload,
)

__all__ = [
    "Artist",
    "PostArtist",
    "ApiError",
    "Id",
    "IdAndTimestamps", 
    "RequiresAuth",
    "NoPayload",
    "SuccessResponse",
]