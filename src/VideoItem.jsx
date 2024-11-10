import React, { useEffect, useRef, useState } from 'react';
import './videoitem.css';

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

function VideoItem({ video, userIcons, selectedUser, clipId, onClick }) {
    const containerRef = useRef(null);
    const [isPosterVisible, setIsPosterVisible] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const posterPath = `${import.meta.env.BASE_URL}thumb/${video.Filename}.png`;

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

    const authorIcon = userIcons[video.Poster] || null;
    const authorText = capitalizeFirstLetter(video.Poster.replace(/_/g, ''));
    const dateText = formatDate(video.Date);
    const isCurSelectedUser = video.Poster === selectedUser || selectedUser === null;
    const vidID = extractLastNumber(video.Link_to_message)

    useEffect(() => {
        if (vidID === clipId) {
            setIsActive(true)
            // Add 100ms delay before scrolling
            setTimeout(() => {
                const element = document.getElementById(vidID);
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
    }, [vidID, clipId]);

    return (
        isCurSelectedUser ? (
            <div className={`video-card ${isActive ? 'active' : ''}`} ref={containerRef} id={vidID}>
                <div className="video-wrapper" onClick={() => { onClick(video); setIsActive(false) }}>
                    {isPosterVisible ? (
                        <img
                            src={posterPath}
                            alt={`${video.Filename} thumbnail`}
                            className="video-thumbnail"
                            onError={(e) => { e.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWZbAhzVPm8sF_FoGJPNhfFgMGvFUtzMD0Dw&s"; }}
                        />
                    ) : (
                        <div className="video-placeholder">
                            <p>Loading...</p>
                        </div>
                    )}
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
