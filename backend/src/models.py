from typing import NotRequired, TypedDict
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship
from datetime import datetime
from flask_login import UserMixin  # pyright: ignore
from werkzeug.security import generate_password_hash, check_password_hash
import os


class Base(DeclarativeBase):
    __slots__ = ()


db = SQLAlchemy(model_class=Base)

environment = os.environ["FLASK_ENV"]

# ----------------------- Association Tables ------------------------- #


class playlists_join(Base):
    __tablename__ = "playlists_join"

    playlist_id: Mapped[int] = mapped_column(ForeignKey("playlists.id"), primary_key=True)
    song_id: Mapped[int] = mapped_column(ForeignKey("songs.id"), primary_key=True, index=True)


class likes_join(Base):
    __tablename__ = "likes_join"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    song_id: Mapped[int] = mapped_column(ForeignKey("songs.id"), primary_key=True, index=True)


# ------------------------- Model Classes --------------------------- #


class DictUser(TypedDict):
    id: int
    username: str
    email: str
    profile_image: NotRequired[str]
    stage_name: NotRequired[str]
    first_release: NotRequired[str]
    biography: NotRequired[str]
    location: NotRequired[str]
    homepage: NotRequired[str]


class User(Base, UserMixin):
    __tablename__ = "users"

    # Starter code

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True)
    email: Mapped[str] = mapped_column(unique=True)
    hashed_password: Mapped[str]

    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password: str):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password, password)

    def to_dict(self) -> DictUser:
        out: DictUser = {"id": self.id, "username": self.username, "email": self.email}

        if self.profile_image is not None:
            out["profile_image"] = self.profile_image
        if self.stage_name is not None:
            out["stage_name"] = self.stage_name
        if self.first_release is not None:
            out["first_release"] = str(self.first_release)
        if self.biography is not None:
            out["biography"] = self.biography
        if self.location is not None:
            out["location"] = self.location
        if self.homepage is not None:
            out["homepage"] = self.homepage

        return out

    # Our fields
    profile_image: Mapped[str | None]
    stage_name: Mapped[str | None]
    first_release: Mapped[datetime | None]
    biography: Mapped[str | None]
    location: Mapped[str | None]
    homepage: Mapped[str | None]
    # Relationships
    playlists: Mapped[list["Playlist"]] = relationship(back_populates="user")
    comments: Mapped[list["Comment"]] = relationship(back_populates="author")
    songs: Mapped[list["Song"]] = relationship(back_populates="artist")
    liked_songs: Mapped[list["Song"]] = relationship(secondary=likes_join.__table__, back_populates="liking_users")


class Song(Base):
    __tablename__ = "songs"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    artist_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    genre: Mapped[str | None]
    thumb_url: Mapped[str | None]
    song_ref: Mapped[str]
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]
    # Relationships
    artist: Mapped["User"] = relationship(back_populates="songs")
    playlists: Mapped[list["Playlist"]] = relationship(secondary=playlists_join.__table__, back_populates="songs")
    comments: Mapped[list["Comment"]] = relationship(back_populates="song")
    liking_users: Mapped[list["User"]] = relationship(secondary=likes_join.__table__, back_populates="liked_songs")


class Playlist(Base):
    __tablename__ = "playlists"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    thumbnail: Mapped[str | None]
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]
    # Relationships
    user: Mapped["User"] = relationship(back_populates="playlists")
    songs: Mapped[list["Song"]] = relationship(secondary=playlists_join.__table__, back_populates="playlists")


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    song_id: Mapped[int] = mapped_column(ForeignKey("songs.id"), nullable=False, index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    comment_text: Mapped[str]
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]
    # Relationships
    song: Mapped["Song"] = relationship(back_populates="comments")
    author: Mapped["User"] = relationship(back_populates="comments")
