from typing import TypedDict, Required, Callable, Literal


def endpoint[F](_method: Literal['GET', 'POST', 'PUT', 'DELETE'], _route: str) -> Callable[[F], F]:
    def inner(fn: F) -> F:
        return fn
    return inner

class Id(TypedDict):
    id: int

class IdAndTimestamps(Id):
    created_at: str
    updated_at: str

class RequiresAuth(TypedDict):
    pass

# * Songs 


# I want to be able to upload a song, # I want to be able to update a song, # I want to be able to delete a song that I posted
@endpoint("POST", "/api/songs")
@endpoint("PUT", "/api/songs/:song_id")
@endpoint("DELETE", "/api/songs/:song_id")
class Song(TypedDict):
    name: str
    artist_id: int
    genre: str | None
    thumb_url: str | None
    song_ref: str



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
    data: list[GetSong]
    
    

# * Playlists
# I want to be able to make a playlist
# POST /api/playlists

@endpoint("POST", "/api/playlists")
class NewPlaylist(TypedDict, total=False):
    name: Required[str]
    thumbnail: str

class NewPlaylistReturns(IdAndTimestamps):
    pass


# I want to be able to add songs to a playlist I created
@endpoint("POST", "/api/playlists/:playlistId")
class AddToPlaylist(RequiresAuth):
    song_id: int
    

# I want to be able to see all of my playlists
# GET /api/users/:user_id/playlists 

# I want for any songs that I liked to automatically be added to a "My Favorites" playlist
# POST /api/users/:user_id/playlists/1  # ! (was thinking everyone's 1st playlist could be any songs they liked - could this empty playlist be created when a user first signs up?)

# I want to be able to update a playlist (I guess change its name?)
# PUT /api/playlists/playlist_id

# I want to be able to delete a playlist I made (as long as it's not My Favorites)
# DELETE /api/playlists/playlist_id (where playlist_id is not 1)

    
class Playlist(TypedDict):
    name: str
    user_id: int
    

class GetPlaylist(Playlist, IdAndTimestamps):
    pass


    
    

# * Comments 

# I want to be able to comment on a song on that song's page
# POST /api/songs/:song_id/comments  we could have /api/comments but I wasn't sure that we'd need to manage comments the way we did reviews for the Airbnb project.  Perhaps comments could just exist on song pages

# I want to be able to update a comment that I left on a song's page
# PUT /api/songs/:song_id/comments/:comment_id

# I want to be able to delete a comment that I left on a song's page
# DELETE /api/songs/:song_id/comments/:comment_id

class Comment(TypedDict):
    song_id: int
    author_id: int
    comment_text: str

class GetComment(Comment, IdAndTimestamps):
    pass
    
 
# * Likes - Posted to and Deleted from the likes_join table

# I want to be able to like a song and unlike a song
# POST /api/songs/:song_id/likes
# DELETE /api/songs/:song_id/likes
class Like(RequiresAuth):
    pass
    


# * Artists

# I want a link to see an artist's details (from a song page or the homepage)
# GET /api/artists/:artist_id

# if a user posts a song, they are assigned an artist meta page
# POST /api/artists

# class Artist(TypedDict):
#     id: int
#     stage_name: str
#     first_release: str
#     biography: str
#     location: str
#     homepage: str # ! could this also be called artists_website?
    