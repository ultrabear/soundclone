from flask_wtf import FlaskForm  # pyright: ignore
from wtforms import StringField
from wtforms.validators import DataRequired


class SongForm(FlaskForm):
    name = StringField("song-name", validators=[DataRequired()])
    genre = StringField("genre")
    thumb_url = StringField("thumbnail-img")
    song_ref = StringField("song-ref", validators=[DataRequired()])
