from .models import Song, Playlist
from .backend_api import GetSong, PlaylistInfo
from .api.aws_integration import DEFAULT_THUMBNAIL_IMAGE


def db_song_to_api_song(song: Song) -> GetSong:
    api_song: GetSong = {
        "id": song.id,
        "name": song.name,
        "artist_id": song.artist_id,
        "song_ref": song.song_ref,
        "created_at": str(song.created_at),
        "updated_at": str(song.updated_at),
        "num_likes": len(song.liking_users),
        "thumb_url": song.thumb_url or DEFAULT_THUMBNAIL_IMAGE,
        "artist": {"id": song.artist.id, "display_name": song.artist.stage_name or song.artist.username},
    }

    if song.genre is not None:
        api_song["genre"] = song.genre

    return api_song


def db_playlist_to_api(playlist: Playlist) -> PlaylistInfo:
    pinfo: PlaylistInfo = {
        "id": playlist.id,
        "name": playlist.name,
        "created_at": str(playlist.created_at),
        "updated_at": str(playlist.updated_at),
        "thumbnail": playlist.thumbnail or DEFAULT_THUMBNAIL_IMAGE,
    }

    return pinfo
