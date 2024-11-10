import React, { useEffect, useState } from 'react';
import VideoItem from './VideoItem';
import UserSelector from './UserSelector';
import VideoPlayer from './VideoPlayer';
import ChannelSelector from './ChannelSelector';
import './App.css';

function extractLastNumber(url) {
    const parts = url.split('/');
    return parts[parts.length - 1];
}

const CHANNELS = {
    "675233762900049930": {
        name: "Escape From Tarkov",
        filepath: "filtered_messages_675233762900049930.json"
    },
    "1188082042034983034": {
        name: "Warthunder",
        filepath: "filtered_messages_1188082042034983034.json"
    },
    "679675078719569920": {
        name: "Other Games",
        filepath: "filtered_messages_679675078719569920.json"
    }
}

function App() {
    const [videos, setVideos] = useState([]);
    const [userIcons, setUserIcons] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [clipId, setClipId] = useState(null);
    const [channel, setChannel] = useState("675233762900049930")

    // Fetch JSON data for videos based on the selected channel
    useEffect(() => {
        const filepath = CHANNELS[channel].filepath
        const url = `${import.meta.env.BASE_URL}${filepath}`;
        fetch(`${url}`)
            .then((response) => response.json())
            .then((data) => setVideos(data))
            .catch((error) => console.error("Error loading videos:", error));
    }, [channel]);

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}user_icons.json`)
            .then((response) => response.json())
            .then((data) => setUserIcons(data))
            .catch((error) => console.error("Error loading user icons:", error));
    }, []);

    // Toggle overflow on body based on active video, and set active video
    useEffect(() => {
        document.body.style.overflow = activeVideo ? 'hidden' : 'auto';
        if (activeVideo) {
            setClipId(extractLastNumber(activeVideo.Link_to_message))
        }
        return () => {
            document.body.style.overflow = 'auto'; // Reset on cleanup
        };
    }, [activeVideo]);


    // Get and Set Query Params if they exist
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setClipId(params.get('clip'));
        const queryChan = params.get('chan');
        if (queryChan) setChannel(String(queryChan));
    }, []);


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
            <div className='app-navbar'>
                <ChannelSelector CHANNELS={CHANNELS} channel={channel} setChannel={setChannel} />
                <UserSelector userIcons={userIcons} selectedUser={selectedUser} setSelectedUser={setSelectedUser} channel={channel} />
            </div>

            <div className="video-grid">
                {videos.length > 0 ? (
                    videos.map((video) => (
                        <VideoItem
                            key={video.Attachment_URL}
                            video={video}
                            userIcons={userIcons[channel]}
                            selectedUser={selectedUser}
                            clipId={clipId}
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
                    channel={channel}
                />
            )}
        </div>
    );
}

export default App;
