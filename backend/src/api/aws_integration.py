from dataclasses import dataclass
import boto3
import tempfile
import os
import uuid

SOUND_BUCKET_NAME = os.environ["S3_SOUND_BUCKET"]
IMAGE_BUCKET_NAME = os.environ["S3_IMAGE_BUCKET"]
S3_SOUND_LOCATION = f"http://{SOUND_BUCKET_NAME}.s3.amazonaws.com/"
S3_IMAGE_LOCATION = f"http://{IMAGE_BUCKET_NAME}.s3.amazonaws.com/"
ALLOWED_SOUND_EXTENSIONS = {"mp3", "mp4", "m4a", "wav", "ogg"}
ALLOWED_IMAGE_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "gif"}

s3_session = boto3.Session(aws_access_key_id=os.environ["S3_KEY"], aws_secret_access_key=os.environ["S3_SECRET"])

s3_client = s3_session.client("s3")  # pyright: ignore


@dataclass(slots=True)
class AWS_File:
    filename: str
    content_type: str
    content: bytes

    @property
    def bucket(self) -> str:
        if self.content_type == "audio/mpeg":
            return SOUND_BUCKET_NAME
        else:
            return IMAGE_BUCKET_NAME

    @property
    def location(self) -> str:
        if self.content_type == "audio/mpeg":
            return S3_SOUND_LOCATION
        else:
            return S3_IMAGE_LOCATION

    def upload_to_s3(self, acl: str = "public-read"):
        with tempfile.NamedTemporaryFile() as temp_file:
            temp_file.write(self.content)
            temp_file.seek(0)
            try:
                s3_client.upload_fileobj(
                    temp_file,
                    self.bucket,
                    self.filename,
                    ExtraArgs={"ACL": acl, "ContentType": self.content_type},
                )
            except Exception as e:
                return {"errors": str(e)}

            return {"url": f"{self.location}{self.filename}"}


def remove_file_from_s3(filename: str, bucket: str):
    try:
        s3_client.delete_object(Bucket=bucket, Key=filename)
    except Exception as e:
        return {"errors": str(e)}
    return True


def get_unique_filename(filename: str) -> str:
    ext = filename.rsplit(".", 1)[1].lower()
    unique_filename = uuid.uuid4().hex
    return f"{unique_filename}.{ext}"
