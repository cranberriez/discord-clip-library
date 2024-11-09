import React, { useEffect, useState } from 'react';
import VideoItem from './VideoItem';
import UserSelector from './UserSelector';
import './App.css';

function App() {
    const [videos, setVideos] = useState([]);
    const [userIcons, setUserIcons] = useState({});
    const [selectedUser, setSelectedUser] = useState(null)

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
            <UserSelector userIcons={userIcons} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
            <div className="video-grid">
                {videos.length > 0 ? (
                    videos.map((video) => (
                        <VideoItem
                            key={video.Attachment_URL}
                            video={video}
                            userIcons={userIcons}
                            selectedUser={selectedUser}
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
