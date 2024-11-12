from ..models import db, User, environment, SCHEMA
from sqlalchemy.sql import text
from datetime import datetime


# Add users and artists
def seed_users() -> None:
    # Regular users
    demo = User(username="Demo", email="demo@aa.io", password="password")
    marnie = User(username="marnie", email="marnie@aa.io", password="password")
    bobbie = User(username="bobbie", email="bobbie@aa.io", password="password")

    # Artists
    artist1 = User(
        username="artist1",
        email="artist1@example.com",
        password="password",
        profile_image="https://media.them.us/photos/663bc34e344e5d57d900f2ee/16:9/w_2560%2Cc_limit/lady-gaga.jpg",
        stage_name="Cool Artist",
        first_release=datetime.strptime("2023-01-01", "%Y-%m-%d"),
        biography="Bio here",
        location="NYC",
        homepage=None,
    )

    artist2 = User(
        username="artist2",
        email="artist2@example.com",
        password="password",
        profile_image="https://ucarecdn.com/b08dd9d1-6b2a-4e24-8182-2670f83cbacf/-/crop/1916x1300/2,0/-/resize/840x570/",
        stage_name="Awesome Artist",
        first_release=datetime.strptime("2022-01-01", "%Y-%m-%d"),
        biography="Bio here",
        location="LA",
        homepage=None,
    )

    artist3 = User(
        username="artist3",
        email="artist3@example.com",
        password="password",
        profile_image="https://pyxis.nymag.com/v1/imgs/dbb/f89/8fedfcc682a11b2f985272ec455cf4aec4-blackpink.1x.rsquare.w1400.jpg",
        stage_name="Super Artist",
        first_release=datetime.strptime("2022-06-01", "%Y-%m-%d"),
        biography="Bio here",
        location="Chicago",
        homepage=None,
    )

    artist4 = User(
        username="artist4",
        email="artist4@example.com",
        password="password",
        profile_image="https://i.guim.co.uk/img/media/67944850a1b5ebd6a0fba9e3528d448ebe360c60/359_0_2469_1482/master/2469.jpg?width=1200&height=900&quality=85&auto=format&fit=crop&s=1157be337c6e200937b038797d772f5f",
        stage_name="Amazing Artist",
        first_release=datetime.strptime("2023-03-01", "%Y-%m-%d"),
        biography="Bio here",
        location="Miami",
        homepage=None,
    )

    db.session.add(demo)
    db.session.add(marnie)
    db.session.add(bobbie)
    db.session.add(artist1)
    db.session.add(artist2)
    db.session.add(artist3)
    db.session.add(artist4)

    db.session.commit()


def undo_users() -> None:
    if environment == "production":
        db.session.execute(text("TRUNCATE table users RESTART IDENTITY CASCADE;"))
    else:
        db.session.execute(text("DELETE FROM users"))

    db.session.commit()
