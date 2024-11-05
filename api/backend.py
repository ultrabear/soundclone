from typing import TypedDict

# * Songs 


# I want to be able to upload a song
# POST /api/songs

# I want to be able to update a song
# PUT /api/songs/:song_id

# I want to be able to delete a song that I posted
# DELETE /api/songs/:song_id

# I want a landing page of other peoples' songs (showing newest first)
# I want to see all of my songs # ! filter by current session's user_id
# I want to see other songs by the same artist on a song's page - # ! filter by artist_id
# GET /api/songs


# I want to view a song's total likes
# Eagerly load (associate) the likes that go with each song from the likes_join table?  Then display the length of that list as the num_likes?

class Song(TypedDict):
    id: int
    name: str
    artist_id: int
    genre: typing.Optional(str)
    thumb_url: typing.Optional(str)
    song_ref: str
    created_at: typing.Optional(str)
    updated_at: typing.Optional(str) # * if user is posting a Song, the request body would not yet have an id, created_at, or updated_at
    
    
# * Playlists


# I want to be able to make a playlist
# POST /api/users/:user_id/playlists

# I want to be able to see all of my playlists
# GET /api/users/:user_id/playlists 

# I want for any songs that I liked to automatically be added to a "My Favorites" playlist
# POST /api/users/:user_id/playlists/1   # ! (was thinking everyone's 1st playlist could be any songs they liked - could this empty playlist be created when a user first signs up?)

# I want to be able to update a playlist (I guess change its name?)
# PUT /api/playlists/playlist_id

# I want to be able to delete a playlist I made (as long as it's not My Favorites)
# DELETE /api/playlists/playlist_id (where playlist_id is not 1)

    
class Playlist(TypedDict):
    id: int
    name: str
    user_id: int
    created_at: typing.Optional(str)
    updated_at: typing.Optional(str) # * if first posting a Playlist, id, created_at, and updated_at would not yet be there
    
    

# * Comments 

# I want to be able to comment on a song on that song's page
# POST /api/songs/:song_id/comments  we could have /api/comments but I wasn't sure that we'd need to manage comments the way we did reviews for the Airbnb project.  Perhaps comments could just exist on song pages

# I want to be able to update a comment that I left on a song's page
# PUT /api/songs/:song_id/comments/:comment_id

# I want to be able to delete a comment that I left on a song's page
# DELETE /api/songs/:song_id/comments/:comment_id

class Comment(TypedDict):
    id: int
    song_id: int
    author_id: int
    comment_text: str
    created_at: typing.Optional(str)
    updated_at: typing.Optional(str) # * won't be there if first posting the Comment
 
# * Likes - Posted to and Deleted from the likes_join table

# I want to be able to like a song
# POST /api/songs/:song_id/likes

# I want to be able to un-like a song
# DELETE /api/songs/:song_id/likes/:like_id


class Like(TypedDict):
    id: int # * won't be there if Like is first being posted
    song_id: int
    user_id: int
    


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
    