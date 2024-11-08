from typing import NotRequired, TypedDict, Callable, Literal


type HttpMethod = Literal["GET", "POST", "PUT", "DELETE"]


def endpoint[F](
    method: HttpMethod | list[HttpMethod],
    route: str,
    *,
    returns: object | None = None,
) -> Callable[[F], F]:
    _ = method, route, returns

    def inner(fn: F) -> F:
        return fn

    return inner


class ApiError(TypedDict):
    message: str
    errors: dict[str, str]


type ApiErrorResponse = tuple[ApiError, int]


class Id(TypedDict):
    id: int


type SongId = int


class IdAndTimestamps(Id):
    created_at: str
    updated_at: str


class RequiresAuth(TypedDict):
    pass


class NoPayload(TypedDict):
    pass


# * Songs


# I want to be able to upload a song, # I want to be able to update a song, # I want to be able to delete a song that I posted
@endpoint("POST", "/api/songs")
@endpoint("PUT", "/api/songs/:song_id")
class Song(TypedDict):
    name: str
    artist_id: int
    genre: NotRequired[str]
    thumb_url: NotRequired[str]
    song_ref: str


@endpoint("DELETE", "/api/songs/:song_id")
class DeleteSong(NoPayload):
    pass


# I want to view a song's total likes
# Eagerly load (associate) the likes that go with each song from the likes_join table?  Then display the length of that list as the num_likes?
@endpoint("GET", "/api/songs/:song_id")
class GetSong(Song, IdAndTimestamps):
    pass


# I want a landing page of other peoples' songs (showing newest first)
# I want to see all of my songs # ! filter by current session's user_id
# I want to see other songs by the same artist on a song's page - # ! filter by artist_id
@endpoint("GET", "/api/songs")
class GetSongs(TypedDict):
    songs: list[GetSong]


# * Playlists


# I want to be able to make a playlist
@endpoint("POST", "/api/playlists")
class BasePlaylist(TypedDict):
    name: str
    thumbnail: NotRequired[str]


# I want to be able to update a playlist (I guess change its name?)
@endpoint("PUT", "/api/playlists/:playlistId")
class UpdatePlaylist(RequiresAuth, BasePlaylist):
    pass


class NewPlaylistReturns(IdAndTimestamps):
    pass


class PlaylistInfo(BasePlaylist, IdAndTimestamps):
    pass


# I want to delete a playlist
@endpoint("DELETE", "/api/playlists/:playlistId")
class DeletePlaylist(NoPayload):
    pass


# I want to be able to add and remove songs to a playlist I created
@endpoint(["DELETE", "POST"], "/api/playlists/:playlistId/songs")
class PopulatePlaylist(RequiresAuth):
    song_id: int


# I want to see all of the songs in my playlist
@endpoint("GET", "/api/playlists/:playlistId/songs")
class PlaylistSongs(GetSongs):
    pass


# I want to be able to see all of my playlists
@endpoint("GET", "/api/playlists/current")
class ListOfPlaylist(TypedDict):
    playlists: list[PlaylistInfo]


# I want for any songs that I liked to automatically be added to a "My Favorites" playlist
# ^ Implemented in frontend via /api/likes call


@endpoint("GET", "/api/likes")
class GetLikes(RequiresAuth, GetSongs):
    pass


# I want to be able to like a song and unlike a song
@endpoint(["POST", "DELETE"], "/api/songs/:song_id/likes")
class ChangeLike(NoPayload):
    pass


# * Comments


# I want to be able to comment on a song on that song's page
@endpoint("POST", "/api/songs/:song_id/comments")
# I want to be able to update a comment that I left on a song's page
@endpoint("PUT", "/api/comments/:comment_id")
class Comment(TypedDict):
    text: str


class CommentResponse(IdAndTimestamps):
    pass


# I want to be able to delete a comment that I left on a song's page
@endpoint("DELETE", "/api/comments/:comment_id")
class DeleteComment(NoPayload):
    pass


class UserComment(Comment, IdAndTimestamps):
    user_id: int


# I want to view all comments of a song
@endpoint("GET", "/api/songs/:song_id/comments")
class GetComments(TypedDict):
    comments: list[UserComment]


# * Artists


class BaseArtist(TypedDict, total=False):
    profile_image: str
    first_release: str
    biography: str
    location: str
    homepage: str


# I want a link to see an artist's details (from a song page or the homepage)
@endpoint("GET", "/api/artists/:artist_id")
class Artist(BaseArtist):
    id: int
    # Do not have username field, backend only shows stage name with username as fallback
    stage_name: str


# if a user posts a song, they can have an artists page
@endpoint("POST", "/api/artists")
class PostArtist(BaseArtist, RequiresAuth):
    stage_name: NotRequired[str]


@endpoint("GET", "/api/auth")
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


@endpoint("POST", "/api/auth/login", returns=User)
class Login(TypedDict):
    email: str
    password: str


@endpoint("POST", "/api/auth/signup", returns=User)
class Signup(Login):
    username: str


@endpoint("GET", "/api/auth/logout")
class Logout(NoPayload):
    pass
