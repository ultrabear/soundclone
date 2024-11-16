from flask_wtf import FlaskForm  # pyright: ignore
from flask_wtf.file import FileField, FileAllowed  # pyright: ignore
from wtforms import StringField
from ..api.aws_integration import ALLOWED_IMAGE_EXTENSIONS


class ArtistForm(FlaskForm):
    stage_name = StringField("stage_name")
    first_release = StringField("first_release")
    profile_image = FileField("profile_image", validators=[FileAllowed(list(ALLOWED_IMAGE_EXTENSIONS))])
    biography = StringField("biography")
    location = StringField("location")
    homepage = StringField("homepage")
