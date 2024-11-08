import React, { useEffect, useRef, useState } from 'react';
import './VideoItem.css';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';

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
    const [isPosterVisible, setIsPosterVisible] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const posterPath = `${import.meta.env.BASE_URL}thumb/${video.Filename}.png`;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasLoaded) {
                    setIsPosterVisible(true);
                    setHasLoaded(true);
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [hasLoaded]);

    const authorIcon = userIcons[video.Poster] || null;
    const authorText = capitalizeFirstLetter(video.Poster.replace(/_/g, ''));
    const dateText = formatDate(video.Date);

    return (
        <div className="video-card" ref={containerRef}>
            <div className="video-wrapper">
                {isPosterVisible ? (
                    <MediaPlayer
                        title={video.Filename}
                        src={video.Attachment_URL}
                        aspectRatio="16/9"
                        load="play"
                        controls={['play', 'progress', 'volume', 'fullscreen']}
                        poster={posterPath}  // Set the poster attribute here
                    >
                        {/* This MediaProvider will handle rendering the video element */}
                        <MediaProvider />
                        <DefaultVideoLayout icons={defaultLayoutIcons} />
                    </MediaPlayer>
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
    );
}

export default VideoItem;
