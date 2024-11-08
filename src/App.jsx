import React, { useEffect, useState } from 'react';
import VideoItem from './VideoItem';
import './App.css';

function App() {
    const [videos, setVideos] = useState([]);
    const [userIcons, setUserIcons] = useState({});

    // Fetch JSON data for videos and user icons
    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}filtered_messages.json`)
            .then((response) => response.json())
            .then((data) => setVideos(data))
            .catch((error) => console.error("Error loading videos:", error));
    }, []);

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}user_icons.json`)
            .then((response) => response.json())
            .then((data) => setUserIcons(data))
            .catch((error) => console.error("Error loading user icons:", error));
    }, []);

    return (
        <div className="App">
            <div className="video-grid">
                {videos.length > 0 ? (
                    videos.map((video) => (
                        <VideoItem
                            key={video.Attachment_URL}
                            video={video}
                            userIcons={userIcons}
                        />
                    ))
                ) : (
                    <p>Loading videos...</p>
                )}
            </div>
        </div>
    );
}

export default App;
