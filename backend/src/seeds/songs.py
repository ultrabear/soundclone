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
        "thumb_url": "https://soundclone-image-files.s3.us-east-1.amazonaws.com/bc92ae1a9219499088c33118fbfc3a2d.jpeg",
        "song_ref": "https://soundclone-sound-files.s3.us-east-1.amazonaws.com/4eb3af34a8c04c36aadeeba95d924153.mp3",
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
        "name": "Ory's Creole Trombone",
        "artist_id": 5,
        "genre": "jazz",
        "thumb_url": "https://soundclone-image-files.s3.us-east-1.amazonaws.com/bb9fad5df8294de5980c53add6e0c6fa.png",
        "song_ref": "https://soundclone-sound-files.s3.us-east-1.amazonaws.com/e805e62d75d04ed69d23f16703320bd7.wav",
        "created_at": str(datetime.now(timezone.utc)),
        "updated_at": str(datetime.now(timezone.utc)),
    },
    {
        "id": 4,
        "name": "Amazing Grace",
        "artist_id": 6,
        "genre": "classical/spiritual",
        "song_ref": "https://soundclone-sound-files.s3.us-east-1.amazonaws.com/a160db30d9e34a38b55efeaa42b7a20b.mp3",
        "created_at": str(datetime.now(timezone.utc)),
        "updated_at": str(datetime.now(timezone.utc)),
    },
    {
        "id": 5,
        "name": "Danse Russe",
        "artist_id": 6,
        "genre": "classical",
        "song_ref": "https://soundclone-sound-files.s3.us-east-1.amazonaws.com/938a7465d2154aaf9f952ec7894b132c.mp3",
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
            thumb_url=song["thumb_url"],  # pyright: ignore
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
