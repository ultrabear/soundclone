import os
from flask import Flask, request, redirect, Response, Blueprint
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import generate_csrf  # pyright: ignore
from flask_login import LoginManager, login_required  # pyright: ignore
from .models import db, User
from .api.auth_routes import auth_routes, update_user_profile
from .api.artist_routes import artist_routes
from .api.playlist_routes import playlist_routes
from .api.comments_routes import comment_routes
from .api.song_routes import song_routes
from .api.likes_routes import bp as likes_routes
from .seeds import seed_commands
from .config import Config
from typing import List, Dict, Union
from .api.search_routes import search_routes

app = Flask(__name__, static_folder="../../frontend/dist", static_url_path="/")

# Setup login manager
login = LoginManager(app)
login.login_view = "auth.unauthorized"  # pyright: ignore


@login.user_loader  # pyright: ignore
def load_user(id: str) -> User | None:
    return db.session.query(User).get(int(id))


# Tell flask about our seed commands
app.cli.add_command(seed_commands)

# Configure app
app.config.from_object(Config)

# Register blueprints
app.register_blueprint(auth_routes, url_prefix="/api/auth")

# Create and register profile routes
profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/profile", methods=["POST"])
@login_required
def profile_route():
    return update_user_profile()


app.register_blueprint(profile_bp, url_prefix="/api")
app.register_blueprint(playlist_routes, url_prefix="/api/playlists")
app.register_blueprint(comment_routes, url_prefix="/api")
app.register_blueprint(likes_routes, url_prefix="/api")
app.register_blueprint(song_routes, url_prefix="/api/songs")
app.register_blueprint(artist_routes)
app.register_blueprint(search_routes)


# Initialize database
db.init_app(app)
Migrate(app, db)

# Application Security
CORS(app)


@app.before_request
def https_redirect():
    """Redirect HTTP to HTTPS in production"""
    if os.environ.get("FLASK_ENV") == "production":
        if request.headers.get("X-Forwarded-Proto") == "http":
            url = request.url.replace("http://", "https://", 1)
            code = 301
            return redirect(url, code=code)


@app.after_request
def inject_csrf_token(response: Response) -> Response:
    """Inject CSRF token into response"""
    response.set_cookie(
        "csrf_token",
        generate_csrf(),
        secure=True if os.environ.get("FLASK_ENV") == "production" else False,
        samesite="Strict" if os.environ.get("FLASK_ENV") == "production" else None,
        httponly=True,
    )
    return response


@app.route("/api/docs")
def api_help() -> Dict[str, List[Union[List[str], str | None]]]:  # pyright: ignore
    """Returns all API routes and their doc strings"""
    acceptable_methods = ["GET", "POST", "PUT", "PATCH", "DELETE"]
    route_list: Dict[str, List[Union[List[str], str | None]]] = {
        rule.rule: [
            [method for method in rule.methods if method in acceptable_methods],  # pyright: ignore
            app.view_functions[rule.endpoint].__doc__,
        ]
        for rule in app.url_map.iter_rules()
        if rule.endpoint != "static"
    }
    return route_list


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def react_root(path: str) -> Response:  # pyright: ignore
    """
    Direct to the public directory in react builds in production
    for favicon or index.html requests
    """
    if path == "favicon.ico":
        return app.send_from_directory("public", "favicon.ico")  # pyright: ignore
    return app.send_static_file("index.html")


@app.errorhandler(404)
def not_found(_e: object) -> Response:
    """Handle 404 errors by returning the React app"""
    return app.send_static_file("index.html")
