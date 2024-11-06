from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from datetime import date


class Base(DeclarativeBase):
    __slots__ = ()

db = SQLAlchemy(model_class=Base)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    username: Mapped[str] = mapped_column(nullable=False)
    profile_image: Mapped[str | None] = mapped_column(nullable=True)
    stage_name: Mapped[str | None] = mapped_column(nullable=True)
    first_release: Mapped[date | None] = mapped_column(nullable=True)
    biography: Mapped[str | None] = mapped_column(nullable=True)
    location: Mapped[str | None] = mapped_column(nullable=True)
    homepage: Mapped[str | None] = mapped_column(nullable=True)


class Song(Base):
    __tablename__ = "songs"

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    artist_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    genre: Mapped[str | None] = mapped_column(nullable=True)
    thumb_url: Mapped[str | None] = mapped_column(nullable=True)
    song_ref: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[date] = mapped_column(nullable=False)
    updated_at: Mapped[date] = mapped_column(nullable=False)

class Playlist(Base):
    __tablename__ = "playlists"

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    thumbnail: Mapped[str | None] = mapped_column(nullable=True)
    created_at: Mapped[date] = mapped_column(nullable=False)
    updated_at: Mapped[date] = mapped_column(nullable=False)

class PlaylistsJoin(Base):
    __tablename__ = "playlists_join"

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    playlist_id: Mapped[int] = mapped_column(ForeignKey("playlists.id"), nullable=False)
    song_id: Mapped[int] = mapped_column(ForeignKey("songs.id"), nullable=False)

