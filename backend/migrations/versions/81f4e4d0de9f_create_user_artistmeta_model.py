"""create User/ArtistMeta model

Revision ID: 81f4e4d0de9f
Revises: 
Create Date: 2024-11-04 17:11:58.572259

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '81f4e4d0de9f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('artist_meta',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('stage_name', sa.String(), nullable=True),
    sa.Column('first_release', sa.Date(), nullable=True),
    sa.Column('biography', sa.String(), nullable=True),
    sa.Column('location', sa.String(), nullable=True),
    sa.Column('homepage', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('artist_meta_id', sa.Integer(), nullable=True),
    sa.Column('profile_image', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['artist_meta_id'], ['artist_meta.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('artist_meta_id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('users')
    op.drop_table('artist_meta')
    # ### end Alembic commands ###
