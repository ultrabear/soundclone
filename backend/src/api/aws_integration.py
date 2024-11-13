from dataclasses import dataclass
import boto3
import os
import uuid

SOUND_BUCKET_NAME = os.environ["S3_SOUND_BUCKET"]
IMAGE_BUCKET_NAME = os.environ["S3_IMAGE_BUCKET"]
S3_SOUND_LOCATION = f"http://{SOUND_BUCKET_NAME}.s3.amazonaws.com/"
S3_IMAGE_LOCATION = f"http://{IMAGE_BUCKET_NAME}.s3.amazonaws.com/"
ALLOWED_SOUND_EXTENSIONS = {"mp3", "aac", "m4a", "opus", "wav", "flac", "ogg"}
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
AUDIO_CONTENT_EXT_MAP = {
    "ogg": "ogg",
    "aac": "aac",
    "flac": "flac",
    "m4a": "x-m4a",
    "opus": "ogg",
    "wav": "wav",
    "mp3": "mpeg",
}

s3_session = boto3.Session(aws_access_key_id=os.environ["S3_KEY"], aws_secret_access_key=os.environ["S3_SECRET"])

s3_client = s3_session.client("s3")  # pyright: ignore


@dataclass(slots=True)
class AWS_File:
    filename: str
    content_type: str
    content: bytes

    def upload_to_s3(self, location: str, bucket: str, acl: str = "public-read"):
        try:
            s3_client.upload_fileobj(
                self.content,  # pyright: ignore
                bucket,
                self.filename,
                ExtraArgs={"ACL": acl, "ContentType": self.content_type},
            )
        except Exception as e:
            return {"errors": str(e)}

        return {"url": f"{location}{self.filename}"}


class SongFile(AWS_File):
    def upload(self):
        return self.upload_to_s3(S3_SOUND_LOCATION, SOUND_BUCKET_NAME)


class ImageFile(AWS_File):
    def upload(self):
        return self.upload_to_s3(S3_IMAGE_LOCATION, IMAGE_BUCKET_NAME)


def remove_file_from_s3(filename: str, bucket: str):
    try:
        s3_client.delete_object(Bucket=bucket, Key=filename)
    except Exception as e:
        return {"errors": str(e)}
    return True


def get_unique_filename(filename: str) -> str:
    # This won't work if the song itself has space characters in it
    filename = filename.split(" ")[1].strip("'\"")
    ext = filename.rsplit(".", 1)[1].lower()
    unique_filename = uuid.uuid4().hex
    return f"{unique_filename}.{ext}"
