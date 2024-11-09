import React, { useEffect, useState, useRef } from 'react';
import '@vidstack/react/player/styles/default/theme.css';
import './VideoPlayer.css';

import { MediaPlayer, MediaProvider, Title, useMediaStore } from '@vidstack/react';
import { XMarkIcon, ArrowRightIcon, ArrowLeftIcon, ShareArrowIcon } from '@vidstack/react/icons';

function formatString(str) {
    return str
        .toLowerCase()
        .replace(".mp4", "")
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function VideoPlayer({ video, onClose, onNext, onPrevious, userIcons }) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [volume, setVolume] = useState(0.2); // Default volume
    const [muted, setMuted] = useState(false); // Default muted status
    const mediaPlayerRef = useRef(null);
    const mediaStore = useMediaStore(mediaPlayerRef);

    if (!video) return null;
    const authorIcon = userIcons[video.Poster] || null;
    const title = formatString(video.Filename)

    useEffect(() => {
        // Function to update width and height based on the 16:9 ratio
        const updateDimensions = () => {
            const maxWidth = window.innerWidth * 0.95; // 95% of the viewport width
            const maxHeight = window.innerHeight * 0.95; // 95% of the viewport height
            let width = maxWidth;
            let height = maxWidth * (9 / 16); // Calculate height based on 16:9 aspect ratio

            // Adjust width and height if height exceeds maxHeight
            if (height > maxHeight) {
                height = maxHeight;
                width = maxHeight * (16 / 9);
            }

            setDimensions({ width, height });
        };

        // Set initial dimensions and add listener
        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        // Clean up event listener on component unmount
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const onVolumeChange = (vol) => {
        const { volume, muted } = vol
        setVolume(volume)
        setMuted(muted)
    }

    return (
        <div className="video-player-overlay">
            <MediaPlayer
                className="video-player"
                ref={mediaPlayerRef}
                src={video.Attachment_URL}

                title={title}

                aspectRatio="16/9"
                load="eager"
                autoPlay={true}
                controls={true}
                volume={volume}
                muted={muted}
                style={{ width: dimensions.width, height: dimensions.height }}

                onVolumeChange={onVolumeChange}
            >
                <MediaProvider />
                <Title
                    className='video-player-title'
                />
            </MediaPlayer>
            <div
                className="video-controls"
                style={{ height: dimensions.height }}
            >
                <button className="video-ctrl-btn vcb-top-div" onClick={onClose}><XMarkIcon size={32} /></button>
                <button className="video-ctrl-btn" onClick={onNext}><ArrowRightIcon size={32} /></button>
                <button className="video-ctrl-btn" onClick={onPrevious}><ArrowLeftIcon size={32} /></button>

                {authorIcon && <img
                    src={authorIcon}
                    alt={`${video.Poster}'s icon`}
                    className="author-icon vcb-bot-div"
                />}
                {/* <button className="video-ctrl-btn">?</button> */}
                {/* <ShareArrowIcon size={32} /> */}
            </div>
        </div >
    );
}

export default VideoPlayer;
