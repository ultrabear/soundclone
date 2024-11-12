# backend/src/api/playlist_routes.py

from flask import Blueprint, request
from flask_login import login_required, current_user
from typing import Union, Tuple, Dict, List
from datetime import datetime, timezone
from ..models import db, Playlist, Song
from ..backend_api import (
    BasePlaylist,
    UpdatePlaylist,
    NewPlaylistReturns,
    PlaylistInfo,
    GetSongs,
    ListOfPlaylist,
    PopulatePlaylist,
    PlaylistSongs,
    ApiError,
    NoPayload,
)

playlist_routes = Blueprint("playlists", __name__, url_prefix="/api/playlists")


# 1. user creates a playlist
@playlist_routes.route("", methods=["POST"])
@login_required
def create_playlist() -> Union[NewPlaylistReturns, Tuple[ApiError, int]]:
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

    response: NewPlaylistReturns = {
        "id": playlist.id,
        "name": playlist.name,  
        "thumbnail": playlist.thumbnail, 
        "created_at": str(playlist.created_at),
        "updated_at": str(playlist.updated_at),
    }
    return response, 201


# 2. Update a playlist (name can be changed)
@playlist_routes.route("/<int:playlist_id>", methods=["PUT"]) 
@login_required
def update_playlist(playlist_id: int) -> Union[UpdatePlaylist, Tuple[ApiError, int]]:
    data: UpdatePlaylist = request.get_json()
    name = data.get("name")

    playlist = Playlist.query.filter_by(id=playlist_id, user_id=current_user.id).first()
    if not playlist:
        return ApiError(
            message="Playlist not found", errors={"playlist_id": f"No playlist found with id {playlist_id}"}
        ), 404

    if name:
        playlist.name = name
    playlist.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    response: UpdatePlaylist = {
        "name": playlist.name,
        "thumbnail": playlist.thumbnail,
        "created_at": str(playlist.created_at),
        "updated_at": str(playlist.updated_at),
    }
    return response,200


# 3.Delete a playlist
@playlist_routes.route("/<int:playlist_id>", methods=["DELETE"])
@login_required
def delete_playlist(playlist_id: int) -> Union[NoPayload, Tuple[ApiError, int]]:
    playlist = Playlist.query.filter_by(id=playlist_id, user_id=current_user.id).first()
    if not playlist:
        return ApiError(
            message="Playlist not found", errors={"playlist_id": f"No playlist found with id {playlist_id}"}
        ), 404

    db.session.delete(playlist)
    db.session.commit()
    return {}, 200


# 4. Add/Remove songs to a playlist I created
@playlist_routes.route("/<int:playlist_id>/songs", methods=["POST", "DELETE"])
@login_required
def modify_playlist_songs(playlist_id: int) -> Union[PopulatePlaylist, Tuple[ApiError, int]]:
    data = request.get_json()
    song_id = data.get("song_id")

    playlist = Playlist.query.filter_by(id=playlist_id, user_id=current_user.id).first()
    song = Song.query.get(song_id)

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
    return PopulatePlaylist(song_id=song_id), 200


# 5. get all the songs from a playlist
@playlist_routes.route("/<int:playlist_id>/songs", methods=["GET"])
@login_required
def get_playlist_songs(playlist_id: int) -> Union[PlaylistSongs, Tuple[ApiError, int]]:
    playlist = Playlist.query.filter_by(id=playlist_id, user_id=current_user.id).first()
    if not playlist:
        return ApiError(
            message="Playlist not found", errors={"playlist_id": f"No playlist found with id {playlist_id}"}
        ), 404

    songs: List[Dict[str, str]] = [
        {
            "id": song.id,
            "name": song.name,
            "artist_id": song.artist_id,
            "genre": song.genre,
            "thumb_url": song.thumb_url,
            "song_ref": song.song_ref,
            "created_at": str(song.created_at),
            "updated_at": str(song.updated_at),
        }
        for song in playlist.songs
    ]

    response: PlaylistSongs = {"songs": songs}
    return response, 200


# 6. get all of my playlist of a user
@playlist_routes.route("/current", methods=["GET"])
@login_required
def get_user_playlists() -> Tuple[ListOfPlaylist, int]:
    playlists = Playlist.query.filter_by(user_id=current_user.id).all()
    playlist_data: list[PlaylistInfo] = [
        {
            "id": playlist.id,
            "name": playlist.name,
            "thumbnail": playlist.thumbnail,
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

    songs: List[Dict[str, str]] = [
        {
            "id": song.id,
            "name": song.name,
            "artist_id": song.artist_id,
            "genre": song.genre,
            "thumb_url": song.thumb_url,
            "song_ref": song.song_ref,
            "created_at": str(song.created_at),
            "updated_at": str(song.updated_at),
        }
        for song in favorite_songs
    ]

    response: GetSongs = {"songs": songs}
    return response, 200


# 8. like a song and unlike a song
@playlist_routes.route("/songs/<int:song_id>/likes", methods=["POST", "DELETE"])
@login_required
def change_like(song_id: int) -> Union[Dict[str, str], Tuple[ApiError, int]]:
    song = Song.query.get(song_id)

    if not song:
        return ApiError(message="Song not found", errors={"song_id": f"No song found with id {song_id}"}), 404

    action = ""
    if request.method == "POST":
        # add to the "My favorite" playlist
        if song not in current_user.liked_songs:
            current_user.liked_songs.append(song)
            add_to_favorites_playlist(song)
        action = "liked"

    elif request.method == "DELETE":
        # remove from the playlist
        if song in current_user.liked_songs:
            current_user.liked_songs.remove(song)
        action = "unliked"

    db.session.commit()
    return {"message": f"Song has been {action}"}, 200


# 9. Add to my favorite
def add_to_favorites_playlist(song: Song) -> None:
    # check "My Favorites" for the current user
    favorites_playlist = Playlist.query.filter_by(user_id=current_user.id, name="My Favorites").first()

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

        