from flask import Blueprint, request
from sqlalchemy import or_
from ..models import db, Song, User, Playlist
from typing import TypedDict

search_routes = Blueprint("search", __name__)


class SearchResultDict(TypedDict):
    type: str
    id: int
    name: str
    thumb_url: str | None
    artist_name: str | None


class SearchResponse(TypedDict):
    results: list[SearchResultDict]


@search_routes.route("/api/search")
def search() -> SearchResponse:
    query = request.args.get("q", "")
    if not query or len(query) < 2:
        return SearchResponse(results=[])

    # Search songs
    songs = (
        db.session.query(Song, User.username)
        .join(User, Song.artist_id == User.id)
        .filter(
            or_(
                Song.name.ilike(f"%{query}%"),
            )
        )
        .limit(5)
        .all()
    )

    song_results = [
        SearchResultDict(type="song", id=song.id, name=song.name, thumb_url=song.thumb_url, artist_name=username)
        for song, username in songs
    ]

    # Search artists
    artists = (
        db.session.query(User)
        .filter(or_(User.username.ilike(f"%{query}%"), User.stage_name.ilike(f"%{query}%")))
        .limit(5)
        .all()
    )

    artist_results = [
        SearchResultDict(
            type="artist",
            id=artist.id,
            name=artist.stage_name or artist.username,
            thumb_url=artist.profile_image,
            artist_name=None,
        )
        for artist in artists
    ]

    # Search playlists
    playlists = (
        db.session.query(Playlist, User.username)
        .join(User, Playlist.user_id == User.id)
        .filter(Playlist.name.ilike(f"%{query}%"))
        .limit(5)
        .all()
    )

    playlist_results = [
        SearchResultDict(
            type="playlist", id=playlist.id, name=playlist.name, thumb_url=playlist.thumbnail, artist_name=username
        )
        for playlist, username in playlists
    ]

    all_results = song_results + artist_results + playlist_results
    return SearchResponse(results=all_results)
