import React, { useEffect, useState, memo } from 'react';
import useSignedUrl from "./hooks/useSignedUrl";
import { formatUsername, formatDate, formatTitle, formatTime } from './utils/formatUtils';
import { isExpired } from './utils/videoUtils'
import { TimerIcon } from '@vidstack/react/icons';
import './css/VideoItem.css';

function VideoItem({ video, userIcons, clipId, runtimes, onClick, urlCache }) {
    const [isActive, setIsActive] = useState(false);

    const vidTitle = formatTitle(video.Filename);
    const authorText = formatUsername(video.Poster);
    const dateText = formatDate(video.Date);
    const vidId = video.Id
    const posterPath = useSignedUrl(`${video.Id}.png`, "thumb", urlCache);
    const expired = isExpired(video.Expire_Timestamp)
    const channelId = video.channelId
    const runtime = 0 //runtimes[channelId][vidId]
    const authorIcon = userIcons?.[video.Poster]?.["Url"] || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWZbAhzVPm8sF_FoGJPNhfFgMGvFUtzMD0Dw&s";
    const vidLength = formatTime(runtime)

    useEffect(() => {
        setIsActive(vidId === clipId)
    }, [vidId, clipId]);

    return (
        <div className={`video-card ${isActive ? 'active' : ''}`} id={vidId}>
            <div className="video-wrapper" onClick={() => { onClick(video); }}>
                {vidLength && <div className='video-runtime'>{vidLength}</div>}
                {posterPath ? (
                    <img
                        src={posterPath}
                        alt={`${video.Filename} thumbnail`}
                        className="video-thumbnail"
                        loading="lazy"
                    />
                ) : (
                    <div className="video-placeholder">
                        <p>Loading...</p>
                    </div>
                )}
                {expired &&
                    (<div className='video-expired-cont'>
                        <p>Expired</p>
                        <div className='video-expired-icon'>
                            <TimerIcon size={24} />
                        </div>
                    </div>)
                }
            </div>
            <div className="video-details">
                {authorIcon && (
                    <img
                        src={authorIcon}
                        alt={`${video.Poster}'s icon`}
                        className="author-icon"
                    />
                )}
                <div className='video-subtext'>
                    <p>{vidTitle}</p>
                    <p className="author-text">{authorText}</p>
                    <p className="date">{dateText}</p>
                </div>
            </div>
        </div>
    );
}

export default memo(VideoItem);
