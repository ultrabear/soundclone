# backend/src/api/playlist_routes.py

from flask import Blueprint, request
from flask_login import login_required, current_user  # pyright: ignore
from typing import Union, Tuple, cast
from datetime import datetime, timezone
from ..models import db, Playlist, Song
from ..backend_api import (
    ApiErrorResponse,
    IdAndTimestamps,
    BasePlaylist,
    NoBody,
    Ok,
    PlaylistInfo,
    GetSongs,
    GetSong,
    ListOfPlaylist,
    PopulatePlaylist,
    ApiError,
    Created,
)
from .aws_integration import DEFAULT_THUMBNAIL_IMAGE
from .song_routes import delete_resource_from_aws

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
        "thumb_url": song.thumb_url or DEFAULT_THUMBNAIL_IMAGE,
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
def update_playlist(playlist_id: int) -> Ok[NoBody] | ApiErrorResponse:
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
def delete_playlist(playlist_id: int) -> Ok[NoBody] | ApiErrorResponse:
    playlist = db.session.query(Playlist).filter_by(id=playlist_id, user_id=current_user.id).first()
    if not playlist:
        return ApiError(
            message="Playlist not found", errors={"playlist_id": f"No playlist found with id {playlist_id}"}
        ), 404

    if playlist.thumbnail is not None:
        delete_resource_from_aws(playlist.thumbnail, "image")

    db.session.delete(playlist)
    db.session.commit()
    return ""


@playlist_routes.get("/<int:playlist_id>")
@login_required
def get_playlist(playlist_id: int) -> Ok[PlaylistInfo] | ApiErrorResponse:
    playlist = db.session.query(Playlist).filter_by(id=playlist_id, user_id=current_user.id).one_or_none()

    if playlist is None:
        return {"message": "Playlist not found", "errors": {}}, 404

    return db_playlist_to_api(playlist)


# 4. Add/Remove songs to a playlist I created
@playlist_routes.route("/<int:playlist_id>/songs", methods=["POST", "DELETE"])
@login_required
def modify_playlist_songs(playlist_id: int) -> PopulatePlaylist | ApiErrorResponse:
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


def db_playlist_to_api(playlist: Playlist) -> PlaylistInfo:
    pinfo: PlaylistInfo = {
        "id": playlist.id,
        "name": playlist.name,
        "created_at": str(playlist.created_at),
        "updated_at": str(playlist.updated_at),
    }

    if playlist.thumbnail:
        pinfo["thumbnail"] = playlist.thumbnail

    return pinfo


# 6. get all of my playlist of a user
@playlist_routes.route("/current", methods=["GET"])
@login_required
def get_user_playlists() -> Tuple[ListOfPlaylist, int]:
    playlists = db.session.query(Playlist).filter_by(user_id=current_user.id).all()
    playlist_data: list[PlaylistInfo] = [db_playlist_to_api(playlist) for playlist in playlists]

    response: ListOfPlaylist = {"playlists": playlist_data}
    return response, 200
