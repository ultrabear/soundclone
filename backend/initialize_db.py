import os
from pathlib import Path

BASEDIR = Path(__file__).resolve().parent
INSTANCE_DIR = BASEDIR / "instance"
DB_PATH = INSTANCE_DIR / "dev.db"

INSTANCE_DIR.mkdir(exist_ok=True)

os.environ.update(
    {
        "FLASK_ENV": "development",
        "SCHEMA": "soundclone_schema",
        "FLASK_APP": "src",
        "DATABASE_URL": f"sqlite:///{DB_PATH}",
        "SECRET_KEY": "dev",
        "FLASK_RUN_PORT": "5000",
    }
)

from flask import Flask
from src.models import db

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
app.config["SQLALCHEMY_ECHO"] = True

db.init_app(app)


def init_db():
    with app.app_context():
        db.drop_all()
        db.create_all()
        print("Database initialized!")


if __name__ == "__main__":
    init_db()
