from ..models import db, Song, environment
from sqlalchemy.sql import text
from ..backend_api import Song as SongType
from datetime import datetime, timezone


song_data: list[SongType] = [
    {
        "name": "West End Blues",
        "artist_id": 4,  # Jazz Master
        "genre": "jazz",
        "thumb_url": "https://i.scdn.co/image/ab67616d0000b273c634cd65ba525a56904e94bd",
        "song_ref": "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav",
    },
    {
        "name": "Jubilee",
        "artist_id": 4,  # Jazz Master
        "genre": "jazz",
        "thumb_url": "https://i.scdn.co/image/ab67616d0000b2739e4a3c9e73ce2429c4d1fe70",
        "song_ref": "jubilee.mp3",
    },
    {
        "name": "Instance",
        "artist_id": 5,  # Hip Hop Star
        "genre": "hip-hop",
        "thumb_url": "https://i.scdn.co/image/ab67616d0000b273a1d8c8658dc3c3b30ff5ba48",
        "song_ref": "instance.mp3",
    },
    {
        "name": "Beats & Rhymes",
        "artist_id": 5,  # Hip Hop Star
        "genre": "hip-hop",
        "thumb_url": "https://i.scdn.co/image/ab67616d0000b273b708840fcb50d49f37b12b45",
        "song_ref": "beats-and-rhymes.mp3",
    },
    {
        "name": "String Quartet in F",
        "artist_id": 6,  # Classical Virtuoso
        "genre": "classical",
        "thumb_url": "https://i.scdn.co/image/ab67616d0000b27398fc869e860cf6c95f6fc26f",
        "song_ref": "string-qtet-in-F.mp3",
    },
    {
        "name": "Symphony No. 1",
        "artist_id": 6,  # Classical Virtuoso
        "genre": "classical",
        "thumb_url": "https://i.scdn.co/image/ab67616d0000b273d6d58c6f532a0a3ddb4d85a1",
        "song_ref": "symphony-1.mp3",
    },
    {
        "name": "Move",
        "artist_id": 7,  # Rap Legend
        "genre": "rap",
        "thumb_url": "https://i.scdn.co/image/ab67616d0000b273e0b51e8c6f626aa06504151c",
        "song_ref": "move.mp3",
    },
    {
        "name": "Flow State",
        "artist_id": 7,  # Rap Legend
        "genre": "rap",
        "thumb_url": "https://i.scdn.co/image/ab67616d0000b273c5716278f83f8333ba096e33",
        "song_ref": "flow-state.mp3",
    },
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
        db.session.execute(text("TRUNCATE table songs RESTART IDENTITY CASCADE;"))
    else:
        db.session.execute(text("DELETE FROM songs"))

    db.session.commit()
