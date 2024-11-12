import os
import traceback

from typing import cast
from flask import Blueprint
from flask_login import current_user, login_required  # pyright: ignore
from ..backend_api import ApiErrorResponse, GetSongs, GetSong, NoBody, Ok
from ..models import db, likes_join, User, Song

bp = Blueprint("likes", __name__)


def db_song_to_api_song(song: Song, likes: int) -> GetSong:
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


@bp.get("/likes")
@login_required
def get_likes() -> GetSongs:
    user = cast(User, current_user)

    vals = db.session.query(likes_join).where(likes_join.user_id == user.id).all()

    out: list[GetSong] = []

    # FIXME this sucks
    for like in vals:
        song = db.session.query(Song).where(Song.id == like.song_id).one()

        out.append(db_song_to_api_song(song, len(song.liking_users)))

    return {"songs": out}


@bp.post("/songs/<int:song_id>/likes")
@login_required
def post_like(song_id: int) -> Ok[NoBody] | ApiErrorResponse:
    user = cast(User, current_user)

    song = db.session.query(Song).where(Song.id == song_id).one_or_none()

    if song is None:
        return {"message": "Could not find song", "errors": {}}, 404

    try:
        user.liked_songs.append(song)
    except Exception as e:
        # do not error on unset
        if os.environ.get("FLASK_ENV") == "development":
            traceback.print_exception(e)

        return {"message": "song already liked", "errors": {}}, 403

    db.session.commit()

    return ""


@bp.delete("/songs/<int:song_id>/likes")
@login_required
def delete_like(song_id: int) -> Ok[NoBody] | ApiErrorResponse:
    user = cast(User, current_user)

    song = db.session.query(Song).where(Song.id == song_id).one_or_none()

    if song is None:
        return {"message": "Could not find song", "errors": {}}, 404

    try:
        user.liked_songs.remove(song)
    except Exception as e:
        # do not error on unset
        if os.environ.get("FLASK_ENV") == "development":
            traceback.print_exception(e)

        return {"message": "song already liked", "errors": {}}, 403

    db.session.commit()

    return ""
