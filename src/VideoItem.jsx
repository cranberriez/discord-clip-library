import React, { useEffect, useRef, useState } from 'react';
import './VideoItem.css';

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);

    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function VideoItem({ video, userIcons }) {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
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
        };
    }, []);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.setAttribute('controls', 'controls');
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.removeAttribute('controls');
        }
    };

    const authorIcon = userIcons[video.Poster] || null;
    const authorText = capitalizeFirstLetter(video.Poster.replace(/_/g, ''));
    const dateText = formatDate(video.Date);

    return (
        <div className="video-card" ref={containerRef}>
            <div
                className="video-wrapper"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {isVisible ? (
                    <video ref={videoRef} preload="metadata" className="video-element">
                        <source src={video.Attachment_URL} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div className="video-placeholder">
                        <p>Loading...</p>
                    </div>
                )}
            </div>
            <div className='video-subtext'>
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
    );
}

export default VideoItem;
