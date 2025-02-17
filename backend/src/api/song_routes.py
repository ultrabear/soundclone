from flask import Blueprint, request
from flask_login import login_required, current_user  # pyright: ignore
from sqlalchemy import select
from ..models import Song, db
from ..backend_api import GetSongs, ApiErrorResponse, IdAndTimestamps, GetSong, NoBody, Ok, Created
from ..forms.song_form import SongForm, NewSongForm
from .aws_integration import (
    get_unique_filename,
    SongFile,
    ImageFile,
    remove_file_from_s3,
    HasFileName,
    SOUND_BUCKET_NAME,
    IMAGE_BUCKET_NAME,
    AUDIO_CONTENT_EXT_MAP,
    IMAGE_CONTENT_EXT_MAP,
    DEFAULT_THUMBNAIL_IMAGE,
)
from ..db_to_api import db_song_to_api_song
from datetime import datetime, timezone
import os

song_routes = Blueprint("songs", __name__)

song_not_found_error: ApiErrorResponse = (
    {"message": "Song Not Found", "errors": {"song_not_found_error": "This song could not be found"}},
    404,
)
not_authorized_error: ApiErrorResponse = (
    {
        "message": "Not Authorized",
        "errors": {"user_not_authorized_error": "You are not authorized to modify or delete this song"},
    },
    401,
)


def create_resource_on_aws(resource: HasFileName, file_type: str):
    ## prepare and upload the file
    unique_filename = get_unique_filename(resource.filename)
    file_ext = os.path.splitext(unique_filename)[1]
    if file_type == "song":
        file_content_type = f"audio/{AUDIO_CONTENT_EXT_MAP[file_ext[1:]]}"
        file = SongFile(unique_filename, file_content_type, resource)
        file_reference = file.upload()
        return file_reference["url"]
    else:
        file_content_type = f"image/{IMAGE_CONTENT_EXT_MAP[file_ext[1:]]}"
        file = ImageFile(unique_filename, file_content_type, resource)
        file_reference = file.upload()
        return file_reference["url"]


def delete_resource_from_aws(filename: str, file_type: str):
    if file_type == "song":
        resource_name = filename.rsplit("/", 1)[1]
        bucket_name = SOUND_BUCKET_NAME
    else:
        resource_name = filename.rsplit("/", 1)[1]
        bucket_name = IMAGE_BUCKET_NAME

    remove_file_from_s3(resource_name, bucket_name)


@song_routes.get("")
def get_all_songs() -> GetSongs:
    """
    Check for query params first to see if we need to filter by an artist_id.
    Query for all songs and return them in a list of song dictionaries.
    """
    artist_id: str | None = request.args.get("artist_id")

    if artist_id and artist_id.isdigit():
        id: int = int(artist_id)

        songs = db.session.execute(select(Song).filter(Song.artist_id == id).order_by(Song.created_at.desc()))

        return {"songs": [db_song_to_api_song(song) for (song,) in songs]}

    else:
        songs = db.session.execute(select(Song).order_by(Song.created_at.desc()))

        return {"songs": [db_song_to_api_song(song) for (song,) in songs]}


@song_routes.get("/<int:song_id>")
def get_song(
    song_id: int,
) -> ApiErrorResponse | GetSong:
    """
    Query for single song where song_id matches and associate any likes with that song through likes_join table
    """

    song = db.session.execute(select(Song).where(Song.id == song_id)).one_or_none()

    if not song:
        return song_not_found_error

    s: Song = song[0]

    song_details: GetSong = db_song_to_api_song(s)

    return song_details


@song_routes.post("")
@login_required
def upload_song() -> ApiErrorResponse | Created[IdAndTimestamps]:
    """Create a new song"""
    form = NewSongForm()
    form["csrf_token"].data = request.cookies["csrf_token"]

    if form.validate_on_submit():
        song_url = create_resource_on_aws(form.data["song_file"], "song")

        # handle set thumbnail to None or user provided file
        thumbnail_url_or_none = None
        if form.data["thumbnail_img"] is not None:
            thumbnail_url_or_none = create_resource_on_aws(form.data["thumbnail_img"], "image")

        ## create a song instance on the db
        new_song = Song(
            name=form.data["name"],
            artist_id=current_user.id,
            genre=form.data["genre"],
            thumb_url=thumbnail_url_or_none,
            song_ref=song_url,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.session.add(new_song)
        db.session.commit()

        return {
            "id": int(new_song.id),
            "created_at": str(new_song.created_at),
            "updated_at": str(new_song.updated_at),
        }, 201

    return form.errors, 400


@song_routes.put("/<int:song_id>")
@login_required
def update_song(song_id: int) -> ApiErrorResponse | IdAndTimestamps:
    """Update an existing song"""
    song_to_update = db.session.query(Song).filter(Song.id == song_id).one_or_none()

    if not song_to_update:
        return song_not_found_error

    if song_to_update.artist_id != current_user.id:
        return not_authorized_error

    form = SongForm()
    form["csrf_token"].data = request.cookies["csrf_token"]

    if form.validate_on_submit():
        song_to_update.name = form.data["name"]
        song_to_update.genre = form.data["genre"]
        song_to_update.updated_at = datetime.now(timezone.utc)
        if form.data["thumbnail_img"] is not None:
            delete_resource_from_aws(song_to_update.thumb_url or DEFAULT_THUMBNAIL_IMAGE, "image")
            thumbnail_url = create_resource_on_aws(form.data["thumbnail_img"], "image")
            song_to_update.thumb_url = thumbnail_url

        db.session.commit()

        return {
            "id": song_to_update.id,
            "created_at": str(song_to_update.created_at),
            "updated_at": str(song_to_update.updated_at),
        }

    return form.errors, 400


@song_routes.delete("/<int:song_id>")
@login_required
def delete_song(song_id: int) -> Ok[NoBody] | ApiErrorResponse:
    """Delete a song"""
    song_to_delete = db.session.query(Song).filter(Song.id == song_id).one_or_none()

    if not song_to_delete:
        return song_not_found_error

    if song_to_delete.artist_id != current_user.id:
        return not_authorized_error

    # delete the resource from AWS s3
    delete_resource_from_aws(song_to_delete.song_ref, "song")

    db.session.delete(song_to_delete)
    db.session.commit()

    return "", 200
