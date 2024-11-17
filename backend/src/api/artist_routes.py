from flask import Blueprint, request
from flask_login import current_user  # pyright: ignore
from ..models import User, db
from typing import cast, Union, Tuple
from datetime import datetime, timezone
from ..backend_api import (
    Artist,
    ApiError,
    ReturnPostArtist,
)
from ..forms.artist_form import ArtistForm
from .song_routes import create_resource_on_aws


artist_routes = Blueprint("artists", __name__, url_prefix="/api/artists")


@artist_routes.get("/<int:artist_id>")
def get_artist(artist_id: int) -> Union[Artist, Tuple[ApiError, int]]:
    """
    Get an artist's details by ID.
    Returns (ApiError, 404) if artist not found or if user exists but isn't an artist.
    """
    artist = db.session.query(User).filter_by(id=artist_id).one_or_none()

    if not artist:
        return (ApiError(message="Artist not found", errors={"artist_id": f"No user found with id {artist_id}"}), 404)

    # Build artist response
    result: Artist = {
        "id": artist.id,
        "stage_name": artist.stage_name or artist.username,
        "num_songs_by_artist": len(artist.songs),
    }

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
def post_artist() -> Union[ReturnPostArtist, Tuple[ApiError, int]]:
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
    # if not user.songs:
    #     return (
    #         ApiError(message="Not an artist", errors={"artist": "You must upload a song first to become an artist"}),
    #         403,
    #     )

    form = ArtistForm()
    form["csrf_token"].data = request.cookies["csrf_token"]

    if form.validate_on_submit():
        # form data is required
        if not form.data:
            return (ApiError(message="No data provided", errors={"body": "Request body is required"}), 400)

        try:
            # Create PostArtist response structure
            response: ReturnPostArtist = {
                "created_at": str(user.created_at),
                "updated_at": str(user.updated_at),
                "num_songs_by_artist": len(user.songs),
            }

            if form.data["stage_name"] is not None:
                user.stage_name = form.data["stage_name"]
                response["stage_name"] = form.data["stage_name"]

            # handle thumbnail if user provided
            if form.data["profile_image"] is not None:
                profile_image = create_resource_on_aws(form.data["profile_image"], "image")
                user.profile_image = profile_image

            if form.data["first_release"] is not None:
                try:
                    user.first_release = datetime.fromisoformat(form.data["first_release"])
                    response["first_release"] = form.data["first_release"]
                except ValueError:
                    return (
                        ApiError(
                            message="Invalid date format",
                            errors={"first_release": "Date must be in ISO format (YYYY-MM-DD)"},
                        ),
                        400,
                    )

            if form.data["biography"] is not None:
                user.biography = form.data["biography"]
                response["biography"] = form.data["biography"]

            if form.data["location"] is not None:
                user.location = form.data["location"]
                response["location"] = form.data["location"]

            if form.data["homepage"] is not None:
                user.homepage = form.data["homepage"]
                response["homepage"] = form.data["homepage"]

            user.updated_at = datetime.now(timezone.utc)
            response["updated_at"] = str(user.updated_at)
            db.session.commit()

            return response

        except Exception as e:
            db.session.rollback()
            return (ApiError(message="Failed to update artist profile", errors={"database": str(e)}), 500)

    return form.errors, 400
