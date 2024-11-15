from flask_wtf import FlaskForm  # pyright: ignore
from flask_wtf.file import FileField, FileAllowed, FileRequired  # pyright: ignore
from wtforms import StringField
from wtforms.validators import DataRequired
from ..api.aws_integration import ALLOWED_SOUND_EXTENSIONS, ALLOWED_IMAGE_EXTENSIONS


class SongForm(FlaskForm):
    name = StringField("song-name", validators=[DataRequired()])
    genre = StringField("genre")
    thumbnail_img = StringField("thumbnail-file", validators=[FileAllowed(list(ALLOWED_IMAGE_EXTENSIONS))])
    song_file = FileField("song-file", validators=[FileRequired(), FileAllowed(list(ALLOWED_SOUND_EXTENSIONS))])
