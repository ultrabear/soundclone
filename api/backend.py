from typing import NotRequired, TypedDict, Callable, Literal


type HttpMethod = Literal["GET", "POST", "PUT", "DELETE"]

type NoBody = Literal[""]

type Ok[T] = tuple[T, Literal[200]] | T
type Created[T] = tuple[T, Literal[201]]


def endpoint[F](
    method: HttpMethod | list[HttpMethod],
    route: str,
    *,
    req: object,
    res: object,
    qp: list[str] | None = None,
    auth: bool = False,
) -> Callable[[F], F]:
    _ = method, route, req, res, qp, auth

    def inner(fn: F) -> F:
        return fn

    return inner


class Id(TypedDict):
    id: int


type SongId = int


class IdAndTimestamps(Id):
    created_at: str
    updated_at: str


class NoPayload(TypedDict):
    pass


class ApiError(TypedDict):
    message: str
    errors: dict[str, str]


type ApiErrorResponse = tuple[ApiError, int]

# * Songs


class Song(TypedDict):
    name: str
    artist_id: int
    genre: NotRequired[str]


# I want to be able to upload a song
endpoint("POST", "/api/songs", req=Song, res=Created[IdAndTimestamps], auth=True)
# I want to be able to update a song
endpoint("PUT", "/api/songs/:song_id", req=Song, res=Ok[NoBody], auth=True)
# I want to be able to delete a song that I posted
endpoint("DELETE", "/api/songs/:song_id", req=None, res=Ok[NoBody], auth=True)


class GetSong(Song, IdAndTimestamps):
    num_likes: NotRequired[int]
    song_ref: str
    thumb_url: str


# I want to view a song's total likes
# I want to get song info
endpoint("GET", "/api/songs/:song_id", req=None, res=GetSong)


class GetSongs(TypedDict):
    songs: list[GetSong]


# I want a landing page of other peoples' songs (showing newest first)
# I want to see all of my songs # ! filter by current session's user_id
# I want to see other songs by the same artist on a song's page - # ! filter by artist_id
endpoint("GET", "/api/songs", req=None, res=GetSongs, qp=["artist_id"])

# * Playlists


class BasePlaylist(TypedDict):
    name: str
    thumbnail: NotRequired[str]


# I want to be able to make a playlist
endpoint("POST", "/api/playlists", req=BasePlaylist, res=Created[IdAndTimestamps], auth=True)

# I want to be able to update a playlist (change its name/thumbnail)
endpoint("PUT", "/api/playlists/:playlistId", req=BasePlaylist, res=Ok[NoBody], auth=True)


class PlaylistInfo(BasePlaylist, IdAndTimestamps):
    pass


# I want to get playlist info
endpoint("GET", "/api/playlists/:playlistId", req=None, res=PlaylistInfo, auth=True)


# I want to delete a playlist
endpoint("DELETE", "/api/playlists/:playlistId", req=None, res=Ok[NoBody], auth=True)


class PopulatePlaylist(TypedDict):
    song_id: int


# I want to be able to add and remove songs to a playlist I created
endpoint(
    ["DELETE", "POST"],
    "/api/playlists/:playlistId/songs",
    req=PopulatePlaylist,
    res=Ok[NoBody],
    auth=True,
)


# I want to see all of the songs in my playlist
endpoint("GET", "/api/playlists/:playlistId/songs", req=None, res=GetSongs, auth=True)


class ListOfPlaylist(TypedDict):
    playlists: list[PlaylistInfo]


# I want to be able to see all of my playlists
endpoint("GET", "/api/playlists/current", req=None, res=ListOfPlaylist, auth=True)

# I want for any songs that I liked to automatically be added to a "My Favorites" playlist
# ^ Implemented in frontend via /api/likes call


# I want to get all of my likes
endpoint("GET", "/api/likes", req=None, res=GetSongs, auth=True)


# I want to be able to like a song and unlike a song
endpoint(["POST", "DELETE"], "/api/songs/:song_id/likes", req=None, res=None, auth=True)


# * Comments


class Comment(TypedDict):
    text: str


# I want to be able to comment on a song on that song's page
endpoint("POST", "/api/songs/:song_id/comments", req=Comment, res=IdAndTimestamps, auth=True)

# I want to be able to update a comment that I left on a song's page
endpoint("PUT", "/api/comments/:comment_id", req=Comment, res=IdAndTimestamps, auth=True)


class UserComment(Comment, IdAndTimestamps):
    user_id: int


# I want to be able to delete a comment that I left on a song's page
endpoint("DELETE", "/api/comments/:comment_id", req=None, res=Ok[NoBody], auth=True)


class GetComments(TypedDict):
    comments: list[UserComment]


# I want to view all comments of a song
endpoint("GET", "/api/songs/:song_id/comments", req=None, res=GetComments)


# * Artists


class BaseArtist(TypedDict, total=False):
    profile_image: str
    first_release: str
    biography: str
    location: str
    homepage: str


class Artist(BaseArtist):
    id: int
    # Do not have username field, backend only shows stage name with username as fallback
    stage_name: str


# I want a link to see an artist's details (from a song page or the homepage)
endpoint("GET", "/api/artists/:artist_id", req=None, res=Artist)


class PostArtist(BaseArtist):
    stage_name: NotRequired[str]


# if a user posts a song, they can have an artists page
endpoint("POST", "/api/artists", req=PostArtist, res=Ok[NoBody], auth=True)


class User(TypedDict):
    id: int
    username: str
    email: str
    profile_image: NotRequired[str]
    stage_name: NotRequired[str]
    first_release: NotRequired[str]
    biography: NotRequired[str]
    location: NotRequired[str]
    homepage: NotRequired[str]


class Login(TypedDict):
    email: str
    password: str


class Signup(Login):
    username: str


# I want to restore my session
endpoint("GET", "/api/auth", req=None, res=User, auth=True)

# I want to login/signup
endpoint("POST", "/api/auth/login", req=Login, res=User, auth=False)
endpoint("POST", "/api/auth/signup", req=Signup, res=User, auth=False)

# I want to log out
endpoint("GET", "/api/auth/logout", req=None, res=None, auth=False)
