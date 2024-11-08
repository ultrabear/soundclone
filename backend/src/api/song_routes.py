from flask import Blueprint
from flask_login import login_required  # pyright: ignore

# from flask_login import current_user
from ..models import Song, db

# from ..backend_api import Song as SongType, DeleteSong, GetSong
from ..backend_api import GetSongs

song_routes = Blueprint("songs", __name__)


@song_routes.get("/")
def songs() -> GetSongs:
    """
    Query for all songs and return them in a list of song dictionaries
    """
    songs = db.session.query(Song).all()
    return {"songs": [song.to_dict() for song in songs]}


@song_routes.post("/", methods=["POST"])
@login_required
def upload_song():
    """
    Create a new record of a song on the Songs table.  Redirect user to that song's page
    """
    pass


@song_routes.put("/:song_id", methods=["PUT"])
@login_required
def update_song():
    """
    Change data about a song that exists as long as current_user is authorized to do so
    """
    pass


@song_routes.delete("/:song_id", method=["DELETE"])
@login_required
def delete_song():
    """
    Delete a song as long as the current_user is authorized to do so
    """
    pass


# I want to be able to upload a song, # I want to be able to update a song, # I want to be able to delete a song that I posted
# @endpoint("POST", "/api/songs")
# @endpoint("PUT", "/api/songs/:song_id")
# class Song(TypedDict):
#     name: str
#     artist_id: int
#     genre: NotRequired[str]
#     thumb_url: NotRequired[str]
#     song_ref: str

# @user_routes.get("/<int:id>")
# @login_required
# def user(id: str):
#     """
#     Query for a user by id and returns that user in a dictionary
#     """
#     user = db.session.query(User).get(int(id))
#     assert user is not None
#     return user.to_dict()


# * from backend/api.py

# # * Songs


# @endpoint("DELETE", "/api/songs/:song_id")
# class DeleteSong(NoPayload):
#     pass


# # I want to view a song's total likes
# # Eagerly load (associate) the likes that go with each song from the likes_join table?  Then display the length of that list as the num_likes?
# @endpoint("GET", "/api/songs/:song_id")
# class GetSong(Song, IdAndTimestamps):
#     pass


# # I want a landing page of other peoples' songs (showing newest first)
# # I want to see all of my songs # ! filter by current session's user_id
# # I want to see other songs by the same artist on a song's page - # ! filter by artist_id
# @endpoint("GET", "/api/songs")
# class GetSongs(TypedDict):
#     songs: list[GetSong]
