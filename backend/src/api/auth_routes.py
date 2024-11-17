from flask import Blueprint, request
from flask_login import current_user, login_user, logout_user, login_required  # type: ignore
from werkzeug.datastructures import FileStorage
from ..models import User, db
from ..forms.login_form import LoginForm
from ..forms.signup_form import SignUpForm
from datetime import datetime, timezone
from ..api.aws_integration import (
    ImageFile,
    get_unique_filename,
    remove_file_from_s3,
    ALLOWED_IMAGE_EXTENSIONS,
    IMAGE_CONTENT_EXT_MAP,
    IMAGE_BUCKET_NAME,
)

__all__ = ["auth_routes", "update_user_profile"]

auth_routes = Blueprint("auth", __name__)


def dt_now() -> datetime:
    return datetime.now(timezone.utc)


@auth_routes.route("")
def authenticate():
    """
    Authenticates a user.
    """
    if current_user.is_authenticated:
        return current_user.to_dict()
    return {"errors": {"message": "Unauthorized"}}, 401


@auth_routes.route("/login", methods=["POST"])
def login():
    """
    Logs a user in
    """
    form = LoginForm()
    form["csrf_token"].data = request.cookies["csrf_token"]
    if form.validate_on_submit():
        user = db.session.query(User).filter(User.email == form.data["email"]).first()
        login_user(user)
        assert user is not None
        return user.to_dict()
    return form.errors, 401


@auth_routes.route("/logout")
def logout():
    """
    Logs a user out
    """
    logout_user()
    return {"message": "User logged out"}


@auth_routes.route("/signup", methods=["POST"])
def sign_up():
    """
    Creates a new user and logs them in
    """
    form = SignUpForm()
    form["csrf_token"].data = request.cookies["csrf_token"]
    if form.validate_on_submit():
        user = User(
            username=form.data["username"],
            email=form.data["email"],
            password=form.data["password"],
            created_at=dt_now(),
            updated_at=dt_now(),
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return user.to_dict()
    return form.errors, 401


@auth_routes.route("/profile", methods=["POST"])
@login_required
def update_user_profile():
    """Endpoint for updating basic user profile (non-artist fields)"""
    try:
        profile_image: FileStorage | None = request.files.get("profile_image")
        user = current_user

        if profile_image and profile_image.filename:
            if profile_image.filename.split(".")[-1].lower() not in ALLOWED_IMAGE_EXTENSIONS:
                return {"errors": "Invalid image format"}, 400

            filename = get_unique_filename(profile_image.filename)
            image_file = ImageFile(
                filename=filename,
                content_type=f"image/{IMAGE_CONTENT_EXT_MAP[filename.rsplit('.', 1)[1].lower()]}",
                content=profile_image,  # type: ignore
            )

            upload_result = image_file.upload()
            if "errors" in upload_result:
                return {"errors": "Failed to upload image"}, 400

            if user.profile_image:
                old_filename = user.profile_image.split("/")[-1]
                remove_file_from_s3(old_filename, IMAGE_BUCKET_NAME)

            user.profile_image = upload_result["url"]

        user.updated_at = dt_now()
        db.session.commit()

        return user.to_dict()

    except Exception as e:
        print("Error in update_user_profile:", str(e))  # Debug print
        db.session.rollback()
        return {"errors": str(e)}, 500


@auth_routes.route("/artists", methods=["POST"])
@login_required
def update_artist_profile():
    try:
        # Remove the songs check - allow all users to update artist fields
        form_data = request.form
        profile_image: FileStorage | None = request.files.get("profile_image")

        user = current_user

        if "stage_name" in form_data:
            user.stage_name = form_data["stage_name"]
        if "first_release" in form_data and form_data["first_release"]:
            try:
                user.first_release = datetime.strptime(form_data["first_release"], "%Y-%m-%d")
            except ValueError:
                return {"errors": "Invalid date format"}, 400
        if "biography" in form_data:
            user.biography = form_data["biography"]
        if "location" in form_data:
            user.location = form_data["location"]
        if "homepage" in form_data:
            user.homepage = form_data["homepage"]

        if profile_image and profile_image.filename:
            if profile_image.filename.split(".")[-1].lower() not in ALLOWED_IMAGE_EXTENSIONS:
                return {"errors": "Invalid image format"}, 400

            filename = get_unique_filename(profile_image.filename)
            image_file = ImageFile(
                filename=filename,
                content_type=f"image/{IMAGE_CONTENT_EXT_MAP[filename.rsplit('.', 1)[1].lower()]}",
                content=profile_image,  # type: ignore
            )

            upload_result = image_file.upload()
            if "errors" in upload_result:
                return {"errors": "Failed to upload image"}, 400

            if user.profile_image:
                old_filename = user.profile_image.split("/")[-1]
                remove_file_from_s3(old_filename, IMAGE_BUCKET_NAME)

            user.profile_image = upload_result["url"]

        user.updated_at = dt_now()
        db.session.commit()

        return user.to_dict()

    except Exception as e:
        db.session.rollback()
        return {"errors": str(e)}, 500


@auth_routes.route("/unauthorized")
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails
    """
    return {"errors": {"message": "Unauthorized"}}, 401
