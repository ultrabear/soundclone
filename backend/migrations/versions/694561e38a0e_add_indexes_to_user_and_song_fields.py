"""add indexes to user and song fields

Revision ID: 694561e38a0e
Revises: 6a9dea9cd3a8
Create Date: 2024-11-12 22:28:32.026269

"""
from alembic import op
import sqlalchemy as _


# revision identifiers, used by Alembic.
revision = '694561e38a0e'
down_revision = '6a9dea9cd3a8'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('comments', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_comments_author_id'), ['author_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_comments_song_id'), ['song_id'], unique=False)

    with op.batch_alter_table('playlists', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_playlists_user_id'), ['user_id'], unique=False)

    with op.batch_alter_table('songs', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_songs_artist_id'), ['artist_id'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('songs', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_songs_artist_id'))

    with op.batch_alter_table('playlists', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_playlists_user_id'))

    with op.batch_alter_table('comments', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_comments_song_id'))
        batch_op.drop_index(batch_op.f('ix_comments_author_id'))

    # ### end Alembic commands ###
