# backend/src/api/playlist_routes.py

from flask import Blueprint, request
from flask_login import login_required, current_user  # pyright: ignore
from typing import Union, Tuple, cast
from datetime import datetime, timezone
from ..models import db, Playlist, Song
from ..backend_api import (
    IdAndTimestamps,
    BasePlaylist,
    PlaylistInfo,
    GetSongs,
    GetSong,
    ListOfPlaylist,
    PopulatePlaylist,
    ApiError,
    NoPayload,
    Created,
)

playlist_routes = Blueprint("playlists", __name__, url_prefix="/api/playlists")


def db_song_to_api_song(song: Song) -> GetSong:
    api_song: GetSong = {
        "id": song.id,
        "name": song.name,
        "artist_id": song.artist_id,
        "song_ref": song.song_ref,
        "created_at": str(song.created_at),
        "updated_at": str(song.updated_at),
        "num_likes": len(song.liking_users),
        "thumb_url": song.thumb_url,
    }

    if song.genre is not None:
        api_song["genre"] = song.genre

    return api_song


# 1. user creates a playlist
@playlist_routes.route("", methods=["POST"])
@login_required
def create_playlist() -> Union[Created[IdAndTimestamps], Tuple[ApiError, int]]:
    data: BasePlaylist = request.get_json()
    name = data.get("name")
    thumbnail = data.get("thumbnail")

    if not name:
        return ApiError(message="Name is required", errors={"name": "Playlist name cannot be empty"}), 400

    playlist = Playlist(
        name=name,
        user_id=current_user.id,
        thumbnail=thumbnail,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    db.session.add(playlist)
    db.session.commit()

    response: IdAndTimestamps = {
        "id": playlist.id,
        "created_at": str(playlist.created_at),
        "updated_at": str(playlist.updated_at),
    }
    return response, 201


# 2. Update a playlist (name can be changed)
@playlist_routes.route("/<int:playlist_id>", methods=["PUT"])
@login_required
def update_playlist(playlist_id: int) -> Union[str, Tuple[ApiError, int]]:
    data = cast(BasePlaylist, request.get_json())
    name = data.get("name")

    playlist = db.session.query(Playlist).filter_by(id=playlist_id, user_id=current_user.id).first()
    if not playlist:
        return ApiError(
            message="Playlist not found", errors={"playlist_id": f"No playlist found with id {playlist_id}"}
        ), 404

    if name:
        playlist.name = name
    playlist.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return ""


# 3.Delete a playlist
@playlist_routes.route("/<int:playlist_id>", methods=["DELETE"])
@login_required
def delete_playlist(playlist_id: int) -> Union[NoPayload, Tuple[ApiError, int]]:
    playlist = db.session.query(Playlist).filter_by(id=playlist_id, user_id=current_user.id).first()
    if not playlist:
        return ApiError(
            message="Playlist not found", errors={"playlist_id": f"No playlist found with id {playlist_id}"}
        ), 404

    db.session.delete(playlist)
    db.session.commit()
    return {}


# 4. Add/Remove songs to a playlist I created
@playlist_routes.route("/<int:playlist_id>/songs", methods=["POST", "DELETE"])
@login_required
def modify_playlist_songs(playlist_id: int) -> Union[PopulatePlaylist, Tuple[ApiError, int]]:
    data = request.get_json()
    song_id = data.get("song_id")

    playlist = db.session.query(Playlist).filter_by(id=playlist_id, user_id=current_user.id).first()
    song = db.session.query(Song).get(song_id)

    if not playlist or not song:
        return ApiError(
            message="Playlist or song not found",
            errors={"playlist_id": f"No playlist with id {playlist_id}", "song_id": f"No song with id {song_id}"},
        ), 404

    if request.method == "POST":
        if song not in playlist.songs:
            playlist.songs.append(song)

    elif request.method == "DELETE":
        if song in playlist.songs:
            playlist.songs.remove(song)

    playlist.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return PopulatePlaylist(song_id=song_id)


# 5. get all the songs from a playlist
@playlist_routes.route("/<int:playlist_id>/songs", methods=["GET"])
@login_required
def get_playlist_songs(playlist_id: int) -> Union[GetSongs, Tuple[ApiError, int]]:
    playlist = db.session.query(Playlist).filter_by(id=playlist_id, user_id=current_user.id).first()
    if not playlist:
        return ApiError(
            message="Playlist not found", errors={"playlist_id": f"No playlist found with id {playlist_id}"}
        ), 404

    songs: GetSongs = {"songs": [db_song_to_api_song(song) for song in playlist.songs]}

    return songs


# 6. get all of my playlist of a user
@playlist_routes.route("/current", methods=["GET"])
@login_required
def get_user_playlists() -> Tuple[ListOfPlaylist, int]:
    playlists = db.session.query(Playlist).filter_by(user_id=current_user.id).all()
    playlist_data: list[PlaylistInfo] = [
        {
            "id": playlist.id,
            "name": playlist.name,
            "created_at": str(playlist.created_at),
            "updated_at": str(playlist.updated_at),
        }
        for playlist in playlists
    ]

    response: ListOfPlaylist = {"playlists": playlist_data}
    return response, 200


# 7. songs that I liked to automatically be added to a "My Favorites" playlist
@playlist_routes.route("/likes", methods=["GET"])
@login_required
def get_likes() -> Union[GetSongs, Tuple[ApiError, int]]:
    favorite_songs = current_user.liked_songs

    response: GetSongs = {"songs": [db_song_to_api_song(song) for song in favorite_songs]}
    return response


# 8. Add to my favorite
def add_to_favorites_playlist(song: Song) -> None:
    # check "My Favorites" for the current user
    favorites_playlist = db.session.query(Playlist).filter_by(user_id=current_user.id, name="My Favorites").first()

    # if "my favorites" not exists, create one
    if not favorites_playlist:
        favorites_playlist = Playlist(
            name="My Favorites",
            user_id=current_user.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.session.add(favorites_playlist)
        db.session.commit()

    # ensure songs not added to the playlist more than once
    if song not in favorites_playlist.songs:
        favorites_playlist.songs.append(song)
        favorites_playlist.updated_at = datetime.now(timezone.utc)
        db.session.commit()
