import os
from pathlib import Path

BASEDIR = Path(__file__).resolve().parent
INSTANCE_DIR = BASEDIR / "instance"
DB_PATH = INSTANCE_DIR / "dev.db"

INSTANCE_DIR.mkdir(exist_ok=True)

os.environ.update(
    {
        "FLASK_ENV": "development",
        "SCHEMA": "soundclone_schema",
        "FLASK_APP": "src",
        "DATABASE_URL": f"sqlite:///{DB_PATH}",
        "SECRET_KEY": "dev",
        "FLASK_RUN_PORT": "5000",
    }
)

from flask import Flask
from src.models import db, User, Song
from typing import List

app = Flask(__name__)

app.config.update(
    {
        "SQLALCHEMY_DATABASE_URI": os.environ.get("DATABASE_URL"),
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "SQLALCHEMY_ECHO": True,
        "SERVER_NAME": None,
        "APPLICATION_ROOT": "/",
        "PREFERRED_URL_SCHEME": "http",
    }
)

db.init_app(app)


with app.app_context():
    try:
        print("\n=== Testing Seeded Data ===\n")

        print("=== User Table Data ===")
        print("Format: User ID | Username | Type | Stage Name (if artist)")
        print("-" * 60)
        users: List[User] = db.session.query(User).all()
        for user in users:
            user_type = "Artist" if user.stage_name else "Regular User"
            stage_info = f"| Stage Name: {user.stage_name}" if user.stage_name else ""
            print(f"ID: {user.id} | {user.username} | {user_type} {stage_info}")

        print(f"\nTotal Users: {len(users)}")
        print(f"Total Artists: {len([u for u in users if u.stage_name])}")

        print("\n=== Song Table Data ===")
        print("Format: Song Name | Artist ID -> Username (Stage Name)")
        print("-" * 60)
        songs: List[Song] = db.session.query(Song).all()
        for song in songs:
            print(f"'{song.name}' | Artist ID {song.artist_id} -> {song.artist.username} ({song.artist.stage_name})")

        print("\n=== Artist/Song Grouping ===")
        print("Shows which songs belong to each artist:")
        print("-" * 60)
        artists = [u for u in users if u.stage_name]
        for artist in artists:
            print(f"\nArtist ID {artist.id}: {artist.username} ({artist.stage_name})")
            artist_songs = [s for s in songs if s.artist_id == artist.id]
            if artist_songs:
                print("Songs:")
                for song in artist_songs:
                    print(f"  - {song.name}")
            else:
                print("  No songs yet")

        print("\n=== Seeder Test Complete ===\n")

    except Exception as e:
        print(f"\nError occurred: {str(e)}\n")
        if hasattr(e, "__dict__"):
            print(f"Error details: {e.__dict__}")
