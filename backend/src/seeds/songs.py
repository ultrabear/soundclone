from ..models import db, Song, environment
from sqlalchemy.sql import text
from ..backend_api import GetSong
from datetime import datetime, timezone

song_data: list[GetSong] = [
    {
        "id": 1,
        "name": "Grandpa's Spells",
        "artist_id": 4,
        "genre": "jazz",
        "song_ref": "https://soundclone-sound-files.s3.us-east-1.amazonaws.com/0d28df8ed79641fe8350e323419946d4.mp3",
        "created_at": str(datetime.now(timezone.utc)),
        "updated_at": str(datetime.now(timezone.utc)),
    },
    {
        "id": 2,
        "name": "Sneak Thievery Theme",
        "artist_id": 4,
        "genre": "jazz",
        "song_ref": "https://soundclone-sound-files.s3.us-east-1.amazonaws.com/7e7e53c4e2884a6c94ee46c84f145e14.mp3",
        "created_at": str(datetime.now(timezone.utc)),
        "updated_at": str(datetime.now(timezone.utc)),
    },
    {
        "id": 3,
        "name": "Instance",
        "artist_id": 5,
        "genre": "hip-hop",
        "song_ref": "",
        "created_at": str(datetime.now(timezone.utc)),
        "updated_at": str(datetime.now(timezone.utc)),
    },
    {
        "id": 4,
        "name": "String Quartet in F",
        "artist_id": 6,
        "genre": "classical",
        "song_ref": "",
        "created_at": str(datetime.now(timezone.utc)),
        "updated_at": str(datetime.now(timezone.utc)),
    },
    {
        "id": 5,
        "name": "Move",
        "artist_id": 7,
        "genre": "rap",
        "song_ref": "",
        "created_at": str(datetime.now(timezone.utc)),
        "updated_at": str(datetime.now(timezone.utc)),
    },
]


def seed_songs() -> None:
    for song in song_data:
        new_song = Song(
            id=song["id"],
            name=song["name"],
            artist_id=song["artist_id"],
            genre=song["genre"],  # pyright: ignore
            created_at=song["created_at"],
            updated_at=song["updated_at"],
        )
        db.session.add(new_song)

    db.session.commit()


def undo_songs() -> None:
    if environment == "production":
        db.session.execute(text("TRUNCATE table songs RESTART IDENTITY CASCADE;"))
    else:
        db.session.execute(text("DELETE FROM songs"))

    db.session.commit()
