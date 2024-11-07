import os


def env(s: str) -> str:
    return os.environ[s]


class Config:
    SQLALCHEMY_DATABASE_URI = env("DATABASE_URL")
    SECRET_KEY = env("SECRET_KEY")
    FLASK_RUN_PORT = env("FLASK_RUN_PORT")
