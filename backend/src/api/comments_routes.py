from flask import Blueprint

from ..backend_api import GetComments


comment_routes = Blueprint("comment", __name__, url_prefix="/api/comments")
comment_song_routes = Blueprint("comment_song", __name__, url_prefix="/api/songs")


@comment_song_routes.get("/<int:song_id>/comments")
def get_comments(song_id: str) -> GetComments:
    _id = int(song_id)

    pass
