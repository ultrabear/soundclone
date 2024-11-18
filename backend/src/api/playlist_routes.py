# backend/src/api/playlist_routes.py

from flask import Blueprint, request
from flask_login import login_required, current_user  # pyright: ignore
from typing import Union, Tuple
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
    ListOfPlaylist,
    PopulatePlaylist,
    ApiError,
    Created,
)
from ..db_to_api import db_playlist_to_api, db_song_to_api_song
from .song_routes import create_resource_on_aws, delete_resource_from_aws
from ..forms.playlist_form import PlaylistForm

playlist_routes = Blueprint("playlists", __name__, url_prefix="/api/playlists")


# 1. user creates a playlist
@playlist_routes.route("", methods=["POST"])
@login_required
def create_playlist() -> Union[Created[IdAndTimestamps], Tuple[ApiError, int]]:
    form = PlaylistForm()
    form["csrf_token"].data = request.cookies["csrf_token"]

    if form.validate_on_submit():
        # handle name is required
        if not form.data["name"]:
            return ApiError(message="Name is required", errors={"name": "Playlist name cannot be empty"}), 400

        # handle set thumbnail to None or user provided file
        thumbnail_url_or_none = None
        if form.data["thumbnail_img"] is not None:
            thumbnail_url_or_none = create_resource_on_aws(form.data["thumbnail_img"], "image")

        # construct the playlist
        new_playlist = Playlist(
            name=form.data["name"],
            user_id=current_user.id,
            thumbnail=thumbnail_url_or_none,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        db.session.add(new_playlist)
        db.session.commit()

        response: IdAndTimestamps = {
            "id": new_playlist.id,
            "created_at": str(new_playlist.created_at),
            "updated_at": str(new_playlist.updated_at),
        }
        return response, 201

    return form.errors, 400


# 2. Update a playlist (name can be changed)
@playlist_routes.route("/<int:playlist_id>", methods=["PUT"])
@login_required
def update_playlist(playlist_id: int) -> Ok[BasePlaylist] | ApiErrorResponse:
    data = PlaylistForm()
    data["csrf_token"].data = request.cookies["csrf_token"]

    if data.validate_on_submit():
        name = data.data["name"]
        thumb = data.data["thumbnail_img"]

        playlist = db.session.query(Playlist).filter_by(id=playlist_id, user_id=current_user.id).first()
        if not playlist:
            return ApiError(
                message="Playlist not found", errors={"playlist_id": f"No playlist found with id {playlist_id}"}
            ), 404

        if name:
            playlist.name = name
        if thumb:
            if playlist.thumbnail:
                delete_resource_from_aws(playlist.thumbnail, "image")

            thumb_url = create_resource_on_aws(thumb, "image")

            playlist.thumbnail = thumb_url

        playlist.updated_at = datetime.now(timezone.utc)
        db.session.commit()

        o: BasePlaylist = {"name": playlist.name}

        if playlist.thumbnail:
            o["thumbnail"] = playlist.thumbnail

        return o
    else:
        return data.errors, 400


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


# 6. get all of my playlist of a user
@playlist_routes.route("/current", methods=["GET"])
@login_required
def get_user_playlists() -> Tuple[ListOfPlaylist, int]:
    playlists = db.session.query(Playlist).filter_by(user_id=current_user.id).all()
    playlist_data: list[PlaylistInfo] = [db_playlist_to_api(playlist) for playlist in playlists]

    response: ListOfPlaylist = {"playlists": playlist_data}
    return response, 200
