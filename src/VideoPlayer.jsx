import React, { useEffect, useState, useRef } from 'react';
import '@vidstack/react/player/styles/default/theme.css';
import './css/VideoPlayer.css';

import { MediaPlayer, MediaProvider, Title, useMediaStore } from '@vidstack/react';
import { XMarkIcon, ArrowRightIcon, ArrowLeftIcon, RepeatSquareIcon, PlaybackSpeedCircleIcon, LinkIcon } from '@vidstack/react/icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

function formatString(str) {
    return str
        .toLowerCase()
        .replace(".mp4", "")
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractLastNumber(url) {
    const parts = url.split('/');
    return parts[parts.length - 1];
}

function VideoPlayer({ video, onClose, onNext, onPrevious, userIcons, channel }) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [volume, setVolume] = useState(0.2); // Default volume
    const [muted, setMuted] = useState(false); // Default muted status
    const [autoplay, setAutoplay] = useState(false); // Default autoplay, continue playing the next video on video complete
    const mediaPlayerRef = useRef(null);
    const mediaStore = useMediaStore(mediaPlayerRef);

    if (!video) return null;
    const authorIcon = userIcons[channel][video.Poster] || null;
    const title = formatString(video.Filename);
    const vidId = video.Id
    const posterPath = `${import.meta.env.BASE_URL}thumb/${vidId}.png`;

    useEffect(() => {
        const handleKeyPress = (event) => {
            switch (event.key) {
                case 'Escape':
                    onClose()
                    break;
                case 'd':
                    onNext()
                    break;
                case 'a':
                    onPrevious()
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [onClose, onNext, onPrevious]);

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

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const onVolumeChange = (vol) => {
        const { volume, muted } = vol
        setVolume(volume)
        setMuted(muted)
    }

    const onEnded = () => {
        if (autoplay) {
            setTimeout(() => {
                onNext()
            }, 500)
        }
        else {
            animateClick({ id: "video-plyr-next" })
        }
    }

    const copyToClipboard = (text) => {
        console.log("clipboard:", text)
        // Remove any existing query parameters
        const baseUrl = window.location.origin + window.location.pathname;
        const urlWithText = `${baseUrl}${text}`;

        navigator.clipboard.writeText(urlWithText)
            .catch((err) => {
                console.error("Failed to copy: ", err);
            });
    };

    const animateClick = ({ event = null, id = null }) => {
        let button = null; // Reference to the button itself
        if (event) button = event.currentTarget;
        else if (id) button = document.getElementById(id)
        else return

        button.classList.add("animate");

        // Remove the 'animate' class after the animation completes
        setTimeout(() => {
            button.classList.remove("animate");
        }, 1000); // Match this duration to the animation duration
    };

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
                style={{ maxWidth: dimensions.width, maxHeight: dimensions.height }}
                poster={posterPath}
                playsInline

                onVolumeChange={onVolumeChange}
                onEnded={onEnded}
            >
                <MediaProvider className='video-provider' />
                <Title
                    className='video-player-title'
                />
            </MediaPlayer>
            <div
                className="video-controls"
                style={{ height: window.innerWidth > 1000 ? dimensions.height : 'auto' }}
                data-label="Close"
            >
                <button className="video-ctrl-btn" data-label="Close" onClick={onClose}><XMarkIcon size={32} /></button>
                <div className="author-icon vcb-top-div" >
                    {authorIcon && <img
                        src={authorIcon}
                        alt={`${video.Poster}'s icon`}
                        onError={(e) => { e.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWZbAhzVPm8sF_FoGJPNhfFgMGvFUtzMD0Dw&s"; }}
                    />}
                </div>

                <button className="video-ctrl-btn" id="video-plyr-next" data-label="Next" onClick={onNext}><ArrowRightIcon size={32} /></button>
                <button className="video-ctrl-btn" id="video-plyr-prev" data-label="Previous" onClick={onPrevious}><ArrowLeftIcon size={32} /></button>

                <button className='video-ctrl-btn' data-label="Autoplay" onClick={() => setAutoplay(prev => !prev)}>
                    {!autoplay && <RepeatSquareIcon size={32} />}
                    {autoplay && <PlaybackSpeedCircleIcon size={32} />}
                </button>

                <button
                    className="video-ctrl-btn cpy-btn vcb-bot-div"
                    data-label="Copy Link"
                    onClick={(event) => {
                        copyToClipboard(`?clip=${vidId}&chan=${channel}`)
                        animateClick({ event: event })
                    }}
                ><LinkIcon size={32} /></button>

                <a href={video.Link_to_message} target="_blank"><button className="video-ctrl-btn" data-label="View In Discord">
                    <FontAwesomeIcon icon={faDiscord} className="icon" style={{ width: "32px", height: "32px" }} />
                </button></a>


                {/* <ShareArrowIcon size={32} /> */}
            </div>
        </div >
    );
}

export default VideoPlayer;
