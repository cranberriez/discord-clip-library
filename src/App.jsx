import React, { useEffect, useState, useMemo } from 'react';
import VideoItem from './VideoItem';
import UserSelector from './UserSelector';
import VideoPlayer from './VideoPlayer';
import ChannelSelector from './ChannelSelector';
import './css/App.css';

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
    },
    "1180731401503506453": {
        name: "Lethal Company",
        filepath: "filtered_messages_1180731401503506453.json"
    },
    "677367926176874509": {
        name: "Overwatch",
        filepath: "filtered_messages_677367926176874509.json"
    }
}

function App() {
    const [baseVideos, setBaseVideos] = useState({});
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [channel, setChannel] = useState("675233762900049930");

    // Load all JSON data once and store it in `baseVideos`
    useEffect(() => {
        const fetchData = async () => {
            const videoData = {};
            await Promise.all(
                Object.entries(CHANNELS).map(async ([channelId, { filepath }]) => {
                    const url = `${import.meta.env.BASE_URL}${filepath}`;
                    try {
                        const response = await fetch(url);
                        const data = await response.json();
                        videoData[channelId] = data;
                    } catch (error) {
                        console.error(`Error loading videos for ${channelId}:`, error);
                    }
                })
            );
            setBaseVideos(videoData);
        };

        fetchData();
    }, []);

    // Filter videos by `channelId`
    useEffect(() => {
        const applyFilters = () => {
            const channelVideos = baseVideos[channel] || [];
            setFilteredVideos(channelVideos);
        };

        applyFilters();
    }, [baseVideos, channel]);

    // Sample function to add other filters (e.g., filter by title, date, etc.)
    const applyAdditionalFilters = (filters) => {
        const filtered = baseVideos[channel].filter((video) => {
            // Apply each filter condition
            for (const key in filters) {
                if (filters[key] && video[key] !== filters[key]) return false;
            }
            return true;
        });
        setFilteredVideos(filtered);
    };

    const [userIcons, setUserIcons] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [clipId, setClipId] = useState(null);

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
    // const filteredVideos = selectedUser
    //     ? videos.filter((video) => video.Poster === selectedUser)
    //     : videos;

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
                {filteredVideos.length > 0 ? (
                    filteredVideos.map((video) => (
                        <VideoItem
                            key={video.Attachment_URL}
                            video={video}
                            userIcons={userIcons[channel]}
                            selectedUser={selectedUser}
                            channelId={channel}
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
