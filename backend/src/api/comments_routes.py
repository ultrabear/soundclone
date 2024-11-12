from typing import cast
from datetime import datetime, timezone

from flask import Blueprint, request
from flask_login import current_user, login_required  # pyright: ignore
from sqlalchemy import desc

from ..backend_api import ApiErrorResponse, CommentResponse, GetComments, Comment as ApiComment, NoPayload
from ..models import db, Comment, User as DbUser, Song as DbSong


comment_routes = Blueprint("comment", __name__)


def dt_now() -> datetime:
    return datetime.now(timezone.utc)


@comment_routes.get("/songs/<int:song_id>/comments")
def get_comments(song_id: int) -> GetComments | ApiErrorResponse:
    song_exists = db.session.query(DbSong).filter(DbSong.id == song_id).one_or_none()

    if song_exists is None:
        return {"message": "Song does not exist", "errors": {}}, 404

    comments = db.session.query(Comment).filter(Comment.song_id == song_id).order_by(desc(Comment.created_at)).all()

    return {
        "comments": [
            {
                "id": c.id,
                "text": c.comment_text,
                "user_id": c.author_id,
                "created_at": str(c.created_at),
                "updated_at": str(c.updated_at),
            }
            for c in comments
        ]
    }


@comment_routes.post("/songs/<int:song_id>/comments")
@login_required
def post_new_comment(song_id: int) -> CommentResponse | ApiErrorResponse:
    user = cast(DbUser, current_user)
    text = cast(ApiComment, request.json)

    if "text" not in text:
        return {"message": "Invalid schema", "errors": {"text": "Missing text field"}}, 401

    if len(text["text"]) < 5:
        return {"message": "Invalid schema", "errors": {"text": "Textfield not long enough"}}, 401

    song = db.session.query(DbSong).where(DbSong.id == song_id).one_or_none()

    if song is None:
        return {"message": "Song not found", "errors": {}}, 404

    cu = dt_now()

    c = Comment(comment_text=text["text"], song=song, author=user, created_at=cu, updated_at=cu)

    db.session.add(c)
    db.session.commit()

    return {"id": c.id, "created_at": str(cu), "updated_at": str(cu)}


@comment_routes.put("/comments/<int:comment_id>")
@login_required
def edit_comment(comment_id: int) -> CommentResponse | ApiErrorResponse:
    user = cast(DbUser, current_user)
    text = cast(ApiComment, request.json)

    if "text" not in text:
        return {"message": "Invalid schema", "errors": {"text": "Missing text field"}}, 401

    if len(text["text"]) < 5:
        return {"message": "Invalid schema", "errors": {"text": "Textfield not long enough"}}, 401

    comment = db.session.query(Comment).where(Comment.id == comment_id).one_or_none()

    if comment is None:
        return {"message": "Could not find comment", "errors": {}}, 404

    if comment.author_id != user.id:
        return {"message": "You do not have permission to edit this comment", "errors": {}}, 403

    comment.comment_text = text["text"]
    comment.updated_at = dt_now()

    db.session.commit()

    return {"id": comment.id, "created_at": str(comment.created_at), "updated_at": str(comment.updated_at)}


@comment_routes.delete("/comments/<int:comment_id>")
@login_required
def delete_comment(comment_id: int) -> ApiErrorResponse | NoPayload:
    user = cast(DbUser, current_user)

    comment = db.session.query(Comment).filter(Comment.id == comment_id).one_or_none()

    if comment is None:
        return {"message": "Comment not found", "errors": {}}, 404

    if comment.author_id != user.id:
        return {"message": "You do not have permission to delete this comment", "errors": {}}, 403

    return {}
