from flask import Blueprint
from flask_login import login_required  # pyright: ignore
from ..models import User, db

user_routes = Blueprint("users", __name__)

@user_routes.get("")
@login_required  # Keep this protected - only authenticated users can list all users
def users():
    """
    Query for all users and returns them in a list of user dictionaries
    """
    users = db.session.query(User).all()
    return {"users": [user.to_dict() for user in users]}

@user_routes.get("/<int:id>")
def user(id: int):  # Remove @login_required here
    """
    Query for a user by id and returns that user in a dictionary
    Allow public access to user profiles
    """
    user = db.session.query(User).get(int(id))
    if not user:
        return {"error": "User not found"}, 404
    return user.to_dict()