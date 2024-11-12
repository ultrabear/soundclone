from flask_wtf import FlaskForm  # pyright: ignore
from flask_wtf.file import FileField, FileAllowed, FileRequired  # pyright: ignore
from wtforms import StringField
from wtforms.validators import DataRequired
from ..api.aws_integration import ALLOWED_SOUND_EXTENSIONS


class SongForm(FlaskForm):
    name = StringField("song-name", validators=[DataRequired()])
    genre = StringField("genre")
    thumb_url = StringField("thumbnail-img")
    song_file = FileField("song-ref", validators=[FileRequired(), FileAllowed(list(ALLOWED_SOUND_EXTENSIONS))])
