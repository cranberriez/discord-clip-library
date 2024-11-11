import React, { useEffect, useRef, useState } from 'react';
import './css/VideoItem.css';

function extractLastNumber(url) {
    const parts = url.split('/');
    return parts[parts.length - 1];
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTitle(title) {
    return capitalizeFirstLetter(
        title.replace(".DVR_-_Trim", "")
            .replace("DVR", "")
            .replace("_-_Made_with_Clipchamp", "")
            .replace(/_/g, " ")
            .replace(/\./g, "")
            .replace(/-/g, "")
            .replace(/\d/g, "")
    )
}

function VideoItem({ video, userIcons, selectedUser, channelId, clipId, onClick }) {
    const containerRef = useRef(null);
    const [isPosterVisible, setIsPosterVisible] = useState(false);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setIsPosterVisible(false);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsPosterVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
            observer.disconnect();
        };
    }, [selectedUser]);

    const vidTitle = formatTitle(video.Filename);
    const authorIcon = userIcons[video.Poster] || null;
    const authorText = capitalizeFirstLetter(video.Poster.replace(/_/g, ''));
    const dateText = formatDate(video.Date);
    const isCurSelectedUser = video.Poster === selectedUser || selectedUser === null;
    const vidId = extractLastNumber(video.Link_to_message)
    const posterPath = `${import.meta.env.BASE_URL}thumb/${channelId}.${vidId}.png`;

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
        isCurSelectedUser ? (
            <div className={`video-card ${isActive ? 'active' : ''}`} ref={containerRef} id={vidId}>
                <div className="video-wrapper" onClick={() => { onClick(video); setIsActive(false) }}>
                    {isPosterVisible ? (
                        <img
                            src={posterPath}
                            alt={`${channelId}.${clipId} thumbnail`}
                            className="video-thumbnail"
                        />
                    ) : (
                        <div className="video-placeholder">
                            <p>Loading...</p>
                        </div>
                    )}
                </div>
                <div className='video-title'>
                    <p>{vidTitle}</p>
                </div>
                <div className="video-subtext">
                    {authorIcon && (
                        <img
                            src={authorIcon}
                            alt={`${video.Poster}'s icon`}
                            className="author-icon"
                        />
                    )}
                    <p className="author-text">{authorText}</p>
                    <p className="date">{dateText}</p>
                </div>
            </div>
        ) : null
    );
}

export default VideoItem;
