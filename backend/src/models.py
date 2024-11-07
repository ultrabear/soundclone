from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey, Table, Column, Integer
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship
from datetime import datetime
from flask_login import UserMixin  # pyright: ignore
from werkzeug.security import generate_password_hash, check_password_hash
import os


class Base(DeclarativeBase):
    __slots__ = ()


db = SQLAlchemy(model_class=Base)

environment = os.environ["FLASK_ENV"]
SCHEMA = os.environ["SCHEMA"]

# ----------------------- Association Tables ------------------------- #

if environment == "production":
    kwargs = {"schema": SCHEMA}
else:
    kwargs = {}

playlists_join = Table(
    "playlists_join",
    Base.metadata,
    Column("playlist_id", Integer, ForeignKey("playlists.id"), primary_key=True),
    Column("song_id", Integer, ForeignKey("songs.id"), primary_key=True),
    **kwargs,  # pyright: ignore schema is a valid key
)

likes_join = Table(
    "likes_join",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("song_id", Integer, ForeignKey("songs.id"), primary_key=True),
    **kwargs,  # pyright: ignore schema is a valid key
)


# ------------------------- Model Classes --------------------------- #
class User(Base, UserMixin):
    __tablename__ = "users"

    # Starter code

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    username: Mapped[str] = mapped_column(nullable=False, unique=True)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(nullable=False)

    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password: str):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password, password)

    # TODO(ultrabear): typed to_dict

    # Our fields
    profile_image: Mapped[str] = mapped_column(nullable=True)
    stage_name: Mapped[str] = mapped_column(nullable=True)
    first_release: Mapped[datetime] = mapped_column(nullable=True)
    biography: Mapped[str] = mapped_column(nullable=True)
    location: Mapped[str] = mapped_column(nullable=True)
    homepage: Mapped[str] = mapped_column(nullable=True)
    # Relationships
    playlists: Mapped[list["Playlist"]] = relationship(back_populates="user")
    comments: Mapped[list["Comment"]] = relationship(back_populates="author")
    songs: Mapped[list["Song"]] = relationship(back_populates="artist")
    liked_songs: Mapped[list["Song"]] = relationship(secondary=likes_join, back_populates="liking_users")


class Song(Base):
    __tablename__ = "songs"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    artist_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    genre: Mapped[str] = mapped_column(nullable=True)
    thumb_url: Mapped[str] = mapped_column(nullable=True)
    song_ref: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False)
    updated_at: Mapped[datetime] = mapped_column(nullable=False)
    # Relationships
    artist: Mapped["User"] = relationship(back_populates="songs")
    playlists: Mapped[list["Playlist"]] = relationship(secondary=playlists_join, back_populates="songs")
    comments: Mapped[list["Comment"]] = relationship(back_populates="song")
    liking_users: Mapped[list["User"]] = relationship(secondary=likes_join, back_populates="liked_songs")


class Playlist(Base):
    __tablename__ = "playlists"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    thumbnail: Mapped[str] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False)
    updated_at: Mapped[datetime] = mapped_column(nullable=False)
    # Relationships
    user: Mapped["User"] = relationship(back_populates="playlists")
    songs: Mapped[list["Song"]] = relationship(secondary=playlists_join, back_populates="playlists")


class Comment(Base):
    __tablename__ = "comments"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    song_id: Mapped[int] = mapped_column(ForeignKey("songs.id"), nullable=False)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    comment_text: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False)
    updated_at: Mapped[datetime] = mapped_column(nullable=False)
    # Relationships
    song: Mapped["Song"] = relationship(back_populates="comments")
    author: Mapped["User"] = relationship(back_populates="comments")
