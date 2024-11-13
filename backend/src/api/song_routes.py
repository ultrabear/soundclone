from flask import Blueprint, request
from flask_login import login_required, current_user  # pyright: ignore
from sqlalchemy import select
from ..models import Song, db
from ..backend_api import GetSongs, ApiErrorResponse, IdAndTimestamps, GetSong, NoBody, Ok
from ..forms.song_form import SongForm
from datetime import datetime, timezone


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


def db_song_to_api_song(song: Song, likes: int) -> GetSong:
    """Convert database song to API response format"""
    api_song: GetSong = {
        "id": song.id,
        "name": song.name,
        "artist_id": song.artist_id,
        "song_ref": song.song_ref,
        "created_at": str(song.created_at),
        "updated_at": str(song.updated_at),
        "num_likes": likes,
    }

    if song.thumb_url is not None:
        api_song["thumb_url"] = song.thumb_url

    if song.genre is not None:
        api_song["genre"] = song.genre

    return api_song


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

        return {"songs": [db_song_to_api_song(song, len(song.liking_users)) for (song,) in songs]}

    else:
        songs = db.session.execute(select(Song).order_by(Song.created_at.desc()))

        return {"songs": [db_song_to_api_song(song, len(song.liking_users)) for (song,) in songs]}


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

    song_details: GetSong = db_song_to_api_song(s, len(s.liking_users))

    return song_details


@song_routes.post("")
@login_required
def upload_song() -> ApiErrorResponse | tuple[IdAndTimestamps, int]:
    """Create a new song"""
    form = SongForm()
    form["csrf_token"].data = request.cookies["csrf_token"]

    if form.validate_on_submit():
        new_song = Song(
            name=form.data["name"],
            artist_id=current_user.id,
            genre=form.data["genre"],
            thumb_url=form.data["thumb_url"],
            song_ref=form.data["song_ref"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.session.add(new_song)
        db.session.commit()

        return {
            "id": new_song.id,
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
        song_to_update.thumb_url = form.data["thumb_url"]
        song_to_update.song_ref = form.data["song_ref"]
        song_to_update.updated_at = datetime.now(timezone.utc)

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

    db.session.delete(song_to_delete)
    db.session.commit()

    return "", 200
