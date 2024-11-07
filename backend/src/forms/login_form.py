from typing import Any
from flask_wtf import FlaskForm  # pyright: ignore
from wtforms import StringField
from wtforms.validators import DataRequired, Email, ValidationError
from src.models import User, db


def user_exists(_: "LoginForm", field: Any):
    # Checking if user exists
    email = field.data
    user = db.session.query(User).filter(User.email == email).first()
    if not user:
        raise ValidationError("Email provided not found.")


def password_matches(form: "LoginForm", field: Any):
    # Checking if password matches
    password = field.data
    email = form.data["email"]
    user = db.session.query(User).filter(User.email == email).first()
    if not user:
        raise ValidationError("No such user exists.")
    if not user.check_password(password):
        raise ValidationError("Password was incorrect.")


class LoginForm(FlaskForm):
    email = StringField("email", validators=[DataRequired(), Email(), user_exists])
    password = StringField("password", validators=[DataRequired(), password_matches])
