from flask import Flask
from flask_migrate import Migrate

from .models import db
from .config import Config


app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

Migrate(app, db)

@app.get("/")
def main():
    return "Hello, World!"
