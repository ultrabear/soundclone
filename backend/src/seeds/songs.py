from ..models import db, Song, environment
from sqlalchemy.sql import text
from ..backend_api import Song as SongType
from datetime import datetime, timezone


class SongSeed(SongType):
    song_ref: str
    thumb_url: str
    song_genre: str


song_data: list[SongSeed] = [
    {
        "name": "Grandpa's Spells",
        "artist_id": 4,
        "song_genre": "jazz",
        "thumb_url": "https://soundclone-image-files.s3.us-east-1.amazonaws.com/grandpas.jpeg",
        "song_ref": "https://soundclone-sound-files.s3.us-east-1.amazonaws.com/Grandpa's_Spells.mp3",
    },
    {
        "name": "Sneak Thievery Theme",
        "artist_id": 4,
        "song_genre": "jazz",
        "thumb_url": "https://soundclone-image-files.s3.us-east-1.amazonaws.com/sneak-thievery.jpeg",
        "song_ref": "https://soundclone-sound-files.s3.us-east-1.amazonaws.com/Sneak_Thievery_Theme.mp3",
    },
    {
        "name": "Ory's Creole Trombone",
        "artist_id": 5,
        "song_genre": "jazz",
        "thumb_url": "https://soundclone-image-files.s3.us-east-1.amazonaws.com/kid-ory.png",
        "song_ref": "https://soundclone-sound-files.s3.us-east-1.amazonaws.com/Orys_Creole_Trombone.wav",
    },
    {
        "name": "Amazing Grace",
        "artist_id": 6,
        "song_genre": "classical/spiritual",
        "thumb_url": "",
        "song_ref": "https://soundclone-sound-files.s3.us-east-1.amazonaws.com/Amazing_Grace.mp3",
    },
    {
        "name": "Danse Russe",
        "artist_id": 6,
        "song_genre": "classical",
        "thumb_url": "",
        "song_ref": "https://soundclone-sound-files.s3.us-east-1.amazonaws.com/Danse_Russe.mp3",
    },
]


def seed_songs() -> None:
    for song in song_data:
        new_song = Song(
            name=song["name"],
            artist_id=song["artist_id"],
            song_ref=song["song_ref"],
            genre=song["song_genre"],
            thumb_url=song["thumb_url"],
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
