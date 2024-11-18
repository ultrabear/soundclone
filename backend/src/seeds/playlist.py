from ..models import db, Playlist, Song, environment
from sqlalchemy.sql import text
from ..backend_api import BasePlaylist  # Importing typed structures for playlists
from datetime import datetime, timezone
from typing import List

# Sample playlist data
playlist_data: List[BasePlaylist] = [
    {
        "name": "Jazz Classics",
        "thumbnail": "https://soundclone-image-files.s3.us-east-1.amazonaws.com/jazz-classics.png",
    },
    {
        "name": "Hip Hop Beats",
        "thumbnail": "https://soundclone-image-files.s3.us-east-1.amazonaws.com/hip-hop-playlist.png",
    },
    {
        "name": "Classical Compositions",
        "thumbnail": "https://soundclone-image-files.s3.us-east-1.amazonaws.com/classical-playlist.png",
    },
    {
        "name": "Rap Anthems",
        "thumbnail": "https://soundclone-image-files.s3.us-east-1.amazonaws.com/rap-anthems-playlist.png",
    },
]


# Seed function for playlists
def seed_playlists() -> None:
    for index, data in enumerate(playlist_data, start=1):
        new_playlist = Playlist(
            name=data["name"],
            user_id=index,  # Assumes user_id matches the playlist order; adjust as needed
            thumbnail=data.get("thumbnail"),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        # Adding song associations to playlists
        # Assuming `PopulatePlaylist` defines song associations, we'll use mock song IDs
        song_ids: List[int] = [index * 2 - 1, index * 2]  # Example song IDs; adjust as needed
        for song_id in song_ids:
            song = db.session.get(Song, song_id)
            if song:
                new_playlist.songs.append(song)  # type: ignore

        db.session.add(new_playlist)

    db.session.commit()


# Undo function for playlists
def undo_playlists() -> None:
    if environment == "production":
        db.session.execute(text("TRUNCATE table playlists RESTART IDENTITY CASCADE;"))
    else:
        db.session.execute(text("DELETE FROM playlists"))

    db.session.commit()
