import React, { useEffect, useState } from 'react';
import VideoItem from './VideoItem';
import './App.css';

function App() {
    const [videos, setVideos] = useState([]);
    const [userIcons, setUserIcons] = useState({});

    useEffect(() => {
        // Fetch the videos data
        fetch('/filtered_messages.json')
            .then((response) => response.json())
            .then((data) => setVideos(data))
            .catch((error) => console.error("Error loading videos:", error));
    }, []);

    useEffect(() => {
        // Fetch the user icons data
        fetch('/user_icons.json')
            .then((response) => response.json())
            .then((data) => setUserIcons(data))
            .catch((error) => console.error("Error loading user icons:", error));
    }, []);

    return (
        <div className="App">
            <div className="video-grid">
                {videos.length > 0 ? (
                    videos.map((video, index) => (
                        <VideoItem key={index} video={video} userIcons={userIcons} />
                    ))
                ) : (
                    <p>Loading videos...</p>
                )}
            </div>
        </div>
    );
}

export default App;
