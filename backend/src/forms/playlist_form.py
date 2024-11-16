from flask_wtf import FlaskForm  # pyright: ignore
from flask_wtf.file import FileField, FileAllowed  # pyright: ignore
from wtforms import StringField
from wtforms.validators import DataRequired
from ..api.aws_integration import ALLOWED_IMAGE_EXTENSIONS


class PlaylistForm(FlaskForm):
    name = StringField("song-name", validators=[DataRequired()])
    thumbnail_img = FileField("thumbnail-file", validators=[FileAllowed(list(ALLOWED_IMAGE_EXTENSIONS))])
