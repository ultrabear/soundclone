from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship

from datetime import date


class Base(DeclarativeBase):
    __slots__ = ()


db = SQLAlchemy(model_class=Base)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    username: Mapped[str] = mapped_column(nullable=False)
    artist_meta_id: Mapped[int] = mapped_column(
        ForeignKey("artist_meta.id"), nullable=True, unique=True
    )
    artist_meta: Mapped["ArtistMeta"] = relationship(back_populates="parent")
    profile_image: Mapped[str] = mapped_column(nullable=True)


class ArtistMeta(Base):
    __tablename__ = "artist_meta"

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    stage_name: Mapped[str] = mapped_column(nullable=True)
    first_release: Mapped[date] = mapped_column(nullable=True)
    biography: Mapped[str] = mapped_column(nullable=True)
    location: Mapped[str] = mapped_column(nullable=True)
    homepage: Mapped[str] = mapped_column(nullable=True)

    parent: Mapped[User] = relationship(back_populates="artist_meta")
