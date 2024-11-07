from typing import Any
from flask_wtf import FlaskForm  # pyright: ignore
from wtforms import StringField
from wtforms.validators import DataRequired, Email, ValidationError
from ..models import User, db


def user_exists(_: "SignUpForm", field: Any):
    # Checking if user exists
    email = field.data
    user = db.session.query(User).filter(User.email == email).first()
    if user:
        raise ValidationError("Email address is already in use.")


def username_exists(_: "SignUpForm", field: Any):
    # Checking if username is already in use
    username = field.data
    user = db.session.query(User).filter(User.username == username).first()
    if user:
        raise ValidationError("Username is already in use.")


class SignUpForm(FlaskForm):
    username = StringField("username", validators=[DataRequired(), username_exists])
    email = StringField("email", validators=[DataRequired(), Email(), user_exists])
    password = StringField("password", validators=[DataRequired()])
