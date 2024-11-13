from ..models import db, Song, environment
from sqlalchemy.sql import text
from ..backend_api import Song as SongType
from datetime import datetime, timezone


song_data: list[SongType] = [
    {
        "name": "West End Blues",
        "artist_id": 4,
        "genre": "jazz",
    },
    {"name": "Jubilee", "artist_id": 4, "genre": "jazz"},
    {"name": "Instance", "artist_id": 5, "genre": "hip-hop"},
    {"name": "String Quartet in F", "artist_id": 6, "genre": "classical"},
    {"name": "Move", "artist_id": 7, "genre": "rap"},
]


def seed_songs() -> None:
    for song in song_data:
        new_song = Song(
            name=song["name"],
            artist_id=song["artist_id"],
            genre=song["genre"],  # pyright: ignore
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.session.add(new_song)

    db.session.commit()


def undo_songs() -> None:
    if environment == "production":
        db.session.execute(text("TRUNCATE table songs RESTART IDENTITY CASCADE;"))
    else:
        db.session.execute(text("DELETE FROM songs"))

    db.session.commit()
