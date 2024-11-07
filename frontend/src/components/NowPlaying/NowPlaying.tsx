import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { togglePlayPause } from '../../store/playerSlice';
import { SongWithUser } from '../../types';
import './NowPlaying.css';

interface NowPlayingProps {
    currentSong: SongWithUser | null;
    isPlaying: boolean;
    className?: string;
}

const NowPlaying: React.FC<NowPlayingProps> = ({ 
    currentSong, 
    isPlaying,
    className = '' 
}) => {
    const dispatch = useAppDispatch();
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    const handleTogglePlay = () => {
        dispatch(togglePlayPause());
    };

    const handleProgress = (e: React.MouseEvent<HTMLDivElement>) => {
        if (progressRef.current && audioRef.current) {
            const rect = progressRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            const newTime = percentage * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`now-playing ${className}`}>
            <div className="now-playing-inner">
                {currentSong ? (
                    <>
                        <div className="now-playing-left">
                            <div className="now-playing-art">
                                <img 
                                    src={currentSong.thumb_url || "/default-album-art.png"} 
                                    alt={currentSong.name} 
                                />
                            </div>
                            <div className="now-playing-info">
                                <Link to={`/songs/${currentSong.id}`} className="song-name">
                                    {currentSong.name}
                                </Link>
                                <Link to={`/users/${currentSong.user.id}`} className="artist-name">
                                    {currentSong.user.stage_name || currentSong.user.username}
                                </Link>
                            </div>
                        </div>

                        <div className="now-playing-center">
                            <div className="playback-controls">
                                <button className="control-button" aria-label="Previous">
                                    ⏮
                                </button>
                                <button 
                                    className="control-button play-button"
                                    onClick={handleTogglePlay}
                                    aria-label={isPlaying ? 'Pause' : 'Play'}
                                >
                                    {isPlaying ? '⏸' : '▶'}
                                </button>
                                <button className="control-button" aria-label="Next">
                                    ⏭
                                </button>
                            </div>

                            <div className="progress-bar-container">
                                <span className="time">{formatTime(currentTime)}</span>
                                <div 
                                    className="progress-bar"
                                    ref={progressRef}
                                    onClick={handleProgress}
                                >
                                    <div 
                                        className="progress-bar-fill"
                                        style={{ width: `${(currentTime / duration) * 100}%` }}
                                    />
                                </div>
                                <span className="time">{formatTime(duration)}</span>
                            </div>

                            <audio
                                ref={audioRef}
                                src={currentSong.song_ref}
                                onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
                                onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
                            />
                        </div>

                        <div className="now-playing-right">
                            <button className="action-button" aria-label="Like">
                                ♡
                            </button>
                            <div className="volume-control">
                                <button className="volume-button" aria-label="Volume">
                                    🔊
                                </button>
                                <div className="volume-slider" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-song-playing">
                        No track currently playing
                    </div>
                )}
            </div>
        </div>
    );
};

export default NowPlaying;