from flask import Blueprint
from flask_login import login_required  # pyright: ignore
from ..models import User, db

user_routes = Blueprint("users", __name__)


@user_routes.get("/")
@login_required
def users():
    """
    Query for all users and returns them in a list of user dictionaries
    """
    users = db.session.query(User).all()
    return {"users": [user.to_dict() for user in users]}


@user_routes.get("/<int:id>")
@login_required
def user(id: str):
    """
    Query for a user by id and returns that user in a dictionary
    """
    user = db.session.query(User).get(int(id))
    assert user is not None
    return user.to_dict()
