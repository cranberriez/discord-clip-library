import React, { useEffect, useState, memo } from 'react';
import usePosterPath from "./hooks/usePosterPath";
import { TimerIcon } from '@vidstack/react/icons';
import './css/VideoItem.css';

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatUsername(username) {
    if (username.includes("Deleted User#0000")) return "Arshy"
    return capitalizeFirstLetter(username.replace(/_/g, ''))
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function isExpired(expiredDate) {
    const currentTime = new Date();
    const expirationTime = new Date(expiredDate);
    return expirationTime < currentTime;
}

function formatTitle(title) {
    let output = capitalizeFirstLetter(
        title.replace(".DVR_-_Trim", "")
            .replace("DVR", "")
            .replace("_-_Made_with_Clipchamp", "")
            .replace(/_/g, " ")
            .replace(/\./g, "")
            .replace(/-/g, "")
            .replace(/\d/g, "")
    )
    if (output.length > 1) return output
    else return "No Title"

}

function formatTime(seconds) {
    if (!seconds) return null

    // Determine the total number of hours, minutes, and seconds
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        // Format as HH:MM:SS
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds.toFixed(0)).padStart(2, '0')}`;
    } else {
        // Format as MM:SS
        return `${String(minutes).padStart(1, '0')}:${String(remainingSeconds.toFixed(0)).padStart(2, '0')}`;
    }
}

function VideoItem({ video, userIcons, clipId, runtimes, onClick, urlCache }) {
    const [isActive, setIsActive] = useState(false);

    const vidTitle = formatTitle(video.Filename);
    const authorText = formatUsername(video.Poster);
    console.log(video.Date)
    const dateText = formatDate(video.Date);
    const vidId = video.Id
    const posterPath = usePosterPath(video.Id, urlCache);
    const expired = isExpired(video.Expire_Timestamp)
    const channelId = video.channelId
    const runtime = runtimes[channelId][vidId]
    const authorIcon = userIcons?.[channelId]?.[video.Poster] || null;
    const vidLength = formatTime(runtime)

    useEffect(() => {
        if (vidId === clipId) {
            setIsActive(true)
            // Add 100ms delay before scrolling
            setTimeout(() => {
                const element = document.getElementById(vidId);
                if (element) {
                    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                    const offset = window.innerHeight * 0.2; // 20% viewport height

                    // Scroll to position with offset for padding at the top
                    window.scrollTo({
                        top: elementPosition - offset,
                        behavior: 'smooth',
                    });
                }
            }, 100); // 100ms delay
        }
        else {
            setIsActive(false);
        }
    }, [vidId, clipId]);

    return (
        <div className={`video-card ${isActive ? 'active' : ''}`} id={vidId}>
            <div className="video-wrapper" onClick={() => { onClick(video); setIsActive(false) }}>
                {vidLength && <div className='video-runtime'>{vidLength}</div>}
                {posterPath ? (
                    <img
                        src={posterPath}
                        alt={`${video.Filename} thumbnail`}
                        className="video-thumbnail"
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
