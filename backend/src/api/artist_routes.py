from flask import Blueprint, request
from flask_login import current_user  # pyright: ignore
from ..models import User, db
from typing import cast, Union, Tuple
from datetime import datetime
from ..backend_api import (
    Artist,
    PostArtist,
    ApiError,
)

artist_routes = Blueprint("artists", __name__, url_prefix="/api/artists")


@artist_routes.get("/<int:artist_id>")
def get_artist(artist_id: int) -> Union[Artist, Tuple[ApiError, int]]:
    """
    Get an artist's details by ID.
    Returns (ApiError, 404) if artist not found or if user exists but isn't an artist.
    """
    artist = db.session.query(User).get(artist_id)

    if not artist:
        return (ApiError(message="Artist not found", errors={"artist_id": f"No user found with id {artist_id}"}), 404)

    if not artist.stage_name:
        return (ApiError(message="Not an artist", errors={"artist_id": f"User {artist_id} is not an artist"}), 404)

    # Build artist response
    result: Artist = {"id": artist.id, "stage_name": artist.stage_name}

    # Add optional fields if they exist
    if artist.profile_image:
        result["profile_image"] = artist.profile_image
    if artist.first_release:
        result["first_release"] = str(artist.first_release)
    if artist.biography:
        result["biography"] = artist.biography
    if artist.location:
        result["location"] = artist.location
    if artist.homepage:
        result["homepage"] = artist.homepage

    return result


@artist_routes.post("")
def post_artist() -> Union[PostArtist, Tuple[ApiError, int]]:
    """
    Update artist profile details.
    User must be authenticated and already be an artist (have uploaded at least one song).
    """
    if not current_user.is_authenticated:
        return (
            ApiError(
                message="Authentication required", errors={"auth": "You must be logged in to update artist profile"}
            ),
            401,
        )

    user = cast(User, current_user)
    if not user.stage_name:
        return (
            ApiError(message="Not an artist", errors={"artist": "You must upload a song first to become an artist"}),
            403,
        )

    data = request.get_json()
    if not data:
        return (ApiError(message="No data provided", errors={"body": "Request body is required"}), 400)

    # Validate inputs
    if "stage_name" in data and not isinstance(data["stage_name"], str):
        return (ApiError(message="Invalid stage name", errors={"stage_name": "Stage name must be a string"}), 400)

    if "biography" in data and not isinstance(data["biography"], str):
        return (ApiError(message="Invalid biography", errors={"biography": "Biography must be a string"}), 400)

    if "location" in data and not isinstance(data["location"], str):
        return (ApiError(message="Invalid location", errors={"location": "Location must be a string"}), 400)

    if "homepage" in data and not isinstance(data["homepage"], str):
        return (ApiError(message="Invalid homepage", errors={"homepage": "Homepage must be a string"}), 400)

    try:
        # Create PostArtist response structure
        response: PostArtist = {}  # Start with empty dict since all fields are optional

        if "stage_name" in data:
            user.stage_name = data["stage_name"]
            response["stage_name"] = data["stage_name"]

        if "profile_image" in data:
            # TODO: AWS S3 implementation
            user.profile_image = data["profile_image"]
            response["profile_image"] = data["profile_image"]

        if "first_release" in data:
            try:
                user.first_release = datetime.fromisoformat(data["first_release"])
                response["first_release"] = data["first_release"]
            except ValueError:
                return (
                    ApiError(
                        message="Invalid date format",
                        errors={"first_release": "Date must be in ISO format (YYYY-MM-DD)"},
                    ),
                    400,
                )

        if "biography" in data:
            user.biography = data["biography"]
            response["biography"] = data["biography"]

        if "location" in data:
            user.location = data["location"]
            response["location"] = data["location"]

        if "homepage" in data:
            user.homepage = data["homepage"]
            response["homepage"] = data["homepage"]

        db.session.commit()

        return response

    except Exception as e:
        db.session.rollback()
        return (ApiError(message="Failed to update artist profile", errors={"database": str(e)}), 500)