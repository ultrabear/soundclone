from ..models import db, Song, environment
from sqlalchemy.sql import text
from ..backend_api import Song as SongType
from datetime import datetime, timezone


song_data: list[SongType] = [
    {
        "name": "West End Blues",
        "artist_id": 4,
        "genre": "jazz",
        "thumb_url": "thumbnail-image.jpg",
        # TODO LINK TO LIVE AWS AUDIO FILE
        "song_ref": "west-end-blues.mp3",
    },
    {"name": "Jubilee", "artist_id": 4, "genre": "jazz", "thumb_url": "thumbnail-image.jpg", "song_ref": "jubilee.mp3"},
    {
        "name": "Instance",
        "artist_id": 5,
        "genre": "hip-hop",
        "thumb_url": "thumbnail-image.jpg",
        "song_ref": "instance.mp3",
    },
    {
        "name": "String Quartet in F",
        "artist_id": 6,
        "genre": "classical",
        "thumb_url": "thumbnail-image.jpg",
        "song_ref": "string-qtet-in-F.mp3",
    },
    {"name": "Move", "artist_id": 7, "genre": "rap", "thumb_url": "thumbnail-image.jpg", "song_ref": "move.mp3"},
]


def seed_songs() -> None:
    for song in song_data:
        new_song = Song(
            name=song["name"],
            artist_id=song["artist_id"],
            genre=song["genre"],  # pyright: ignore
            thumb_url=song["thumb_url"],  # pyright: ignore
            song_ref=song["song_ref"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.session.add(new_song)

    db.session.commit()


def undo_songs() -> None:
    if environment == "production":
        db.session.execute(f"TRUNCATE table songs RESTART IDENTITY CASCADE;")  # pyright: ignore
    else:
        db.session.execute(text("DELETE FROM songs"))

    db.session.commit()
