import React, { useEffect, useState, useMemo } from 'react';
import VideoItem from './VideoItem';
import VideoPlayer from './VideoPlayer';
import Navbar from './Navbar';
import './css/App.css';

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
    // Videos and filtering state
    const [baseVideos, setBaseVideos] = useState({});
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState("675233762900049930");

    // User data state
    const [userIcons, setUserIcons] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);

    // Loading states
    const [videosLoading, setVideosLoading] = useState(true);
    const [iconsLoading, setIconsLoading] = useState(true);

    // Current playing video / skip to video
    const [activeVideo, setActiveVideo] = useState(null);
    const [clipId, setClipId] = useState(null);

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
            setVideosLoading(false);
        };

        fetchData();
    }, []);

    // Filter videos by `channelId` and `selectedUser`
    useEffect(() => {
        const applyFilters = () => {
            const channelVideos = baseVideos[selectedChannel] || [];
            const userFiltered = channelVideos.filter((video) => video.Poster === selectedUser || selectedUser === null)
            setFilteredVideos(userFiltered);
        };

        applyFilters();
    }, [baseVideos, selectedChannel, selectedUser]);

    // Get # of clips per poster
    const posterCounts = useMemo(() => {
        if (!baseVideos || baseVideos.length <= 0 || !baseVideos[selectedChannel]) return {};

        return baseVideos[selectedChannel].reduce((acc, item) => {
            acc[item.Poster] = (acc[item.Poster] || 0) + 1;
            return acc;
        }, {});
    }, [selectedChannel, baseVideos]);

    // Fetch user icons json data
    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}user_icons.json`)
            .then((response) => response.json())
            .then((data) => {
                setUserIcons(data)
                setIconsLoading(false);
            })
            .catch((error) => console.error("Error loading user icons:", error));
    }, []);

    // Toggle overflow on body based on active video, and set active video
    useEffect(() => {
        document.body.style.overflow = activeVideo ? 'hidden' : 'auto';
        if (activeVideo) {
            setClipId(activeVideo.Id)
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
        if (queryChan) setSelectedChannel(String(queryChan));
    }, []);

    const getNextVideo = () => {
        if (!activeVideo) return null;
        const currentIndex = filteredVideos.findIndex((video) => video.Id === activeVideo.Id);
        const nextIndex = (currentIndex + 1) % filteredVideos.length;
        return filteredVideos[nextIndex];
    };

    const getPreviousVideo = () => {
        if (!activeVideo) return null;
        const currentIndex = filteredVideos.findIndex((video) => video.Id === activeVideo.Id);
        const previousIndex = (currentIndex - 1 + filteredVideos.length) % filteredVideos.length;
        return filteredVideos[previousIndex];
    };

    // Display a loading message until both videos and user icons are fully loaded
    if (videosLoading || iconsLoading) {
        return <p>Loading content, please wait...</p>;
    }

    return (
        <div className="App">
            {/* <div className='app-navbar'>
                <ChannelSelector CHANNELS={CHANNELS} channel={channel} setChannel={setChannel} />
                <UserSelector userIcons={userIcons} selectedUser={selectedUser} setSelectedUser={setSelectedUser} channel={channel} />
            </div> */}
            <Navbar
                CHANNELS={CHANNELS} selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel}
                userIcons={userIcons} selectedUser={selectedUser} setSelectedUser={setSelectedUser} posterCounts={posterCounts}
            />

            <div className="video-grid">
                {filteredVideos.length > 0 ? (
                    filteredVideos.map((video) => (
                        <VideoItem
                            key={video.Attachment_URL}
                            video={video}
                            userIcons={userIcons[selectedChannel]}
                            selectedUser={selectedUser}
                            channelId={selectedChannel}
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
                    channel={selectedChannel}
                />
            )}
        </div>
    );
}

export default App;
