import os
import traceback

from typing import cast
from flask import Blueprint
from flask_login import current_user, login_required  # pyright: ignore
from ..backend_api import ApiErrorResponse, GetSongs, GetSong, NoBody, Ok
from ..models import db, likes_join, User, Song
from ..db_to_api import db_song_to_api_song

bp = Blueprint("likes", __name__)


@bp.get("/likes")
@login_required
def get_likes() -> GetSongs:
    user = cast(User, current_user)

    vals = db.session.query(likes_join).where(likes_join.user_id == user.id).all()

    out: list[GetSong] = []

    # FIXME this sucks
    for like in vals:
        song = db.session.query(Song).where(Song.id == like.song_id).one()

        out.append(db_song_to_api_song(song))

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
        db.session.commit()
    except Exception as e:
        # do not error on unset
        if os.environ.get("FLASK_ENV") == "development":
            traceback.print_exception(e)

        return {"message": "song already liked", "errors": {}}, 403

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
        db.session.commit()
    except Exception as e:
        # do not error on unset
        if os.environ.get("FLASK_ENV") == "development":
            traceback.print_exception(e)

        return {"message": "song already liked", "errors": {}}, 403

    return ""
