import React, { useEffect, useState } from 'react';
import VideoItem from './VideoItem';
import UserSelector from './UserSelector';
import VideoPlayer from './VideoPlayer';
import './App.css';

function App() {
    const [videos, setVideos] = useState([]);
    const [userIcons, setUserIcons] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);

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

    // Toggle overflow on body based on active video
    useEffect(() => {
        document.body.style.overflow = activeVideo ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto'; // Reset on cleanup
        };
    }, [activeVideo]);

    // Determine the next and previous videos based on activeVideo and selectedUser
    const filteredVideos = selectedUser
        ? videos.filter((video) => video.Poster === selectedUser)
        : videos;

    const getNextVideo = () => {
        if (!activeVideo) return null;
        const currentIndex = filteredVideos.findIndex((video) => video.Attachment_URL === activeVideo.Attachment_URL);
        const nextIndex = (currentIndex + 1) % filteredVideos.length;
        return filteredVideos[nextIndex];
    };

    const getPreviousVideo = () => {
        if (!activeVideo) return null;
        const currentIndex = filteredVideos.findIndex((video) => video.Attachment_URL === activeVideo.Attachment_URL);
        const previousIndex = (currentIndex - 1 + filteredVideos.length) % filteredVideos.length;
        return filteredVideos[previousIndex];
    };

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
                            onClick={setActiveVideo} // Set active video when clicked
                        />
                    ))
                ) : (
                    <p>Loading videos...</p>
                )}
            </div>
            {/* Render VideoPlayer if a video is selected */}
            {activeVideo && (
                <VideoPlayer
                    video={activeVideo}
                    onClose={() => setActiveVideo(null)}
                    onNext={() => setActiveVideo(getNextVideo())}
                    onPrevious={() => setActiveVideo(getPreviousVideo())}
                    userIcons={userIcons}
                />
            )}
        </div>
    );
}

export default App;
