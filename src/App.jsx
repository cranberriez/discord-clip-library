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
    },
    "620814611137953812": {
        name: "Gaming Moments",
        filepath: "filtered_messages_620814611137953812.json"
    },
    "796860146382405642": {
        name: "For Honor",
        filepath: "filtered_messages_796860146382405642.json"
    },
    "1283675776780075058": {
        name: "Deadlock",
        filepath: "filtered_messages_1283675776780075058.json"
    },
    "680162852199596045": {
        name: "Destiny",
        filepath: "filtered_messages_680162852199596045.json"
    },
    "869025643889819700": {
        name: "New World",
        filepath: "filtered_messages_869025643889819700.json"
    },
    "1091159481200689262": {
        name: "CS:GO",
        filepath: "filtered_messages_1091159481200689262.json"
    },
    "1205547794069463061": {
        name: "Helldivers",
        filepath: "filtered_messages_1205547794069463061.json"
    },
    "946788298096001094": {
        name: "Elden Ring",
        filepath: "filtered_messages_946788298096001094.json"
    },
}

function App() {
    // Videos and filtering state
    const [baseVideos, setBaseVideos] = useState({});
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [runtimes, setRuntimes] = useState({});
    const [selectedChannel, setSelectedChannel] = useState("675233762900049930");

    // User data state
    const [userIcons, setUserIcons] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);

    // Loading states
    const [videosLoading, setVideosLoading] = useState(true);
    const [iconsLoading, setIconsLoading] = useState(true);
    const [runtimesLoading, setRuntimesLoading] = useState(true);

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

    // Filter videos by `channelId` and `selectedUser`, and sort by `Date`
    useEffect(() => {
        if (!baseVideos) return;

        const applyFilters = () => {
            let channelVideos = [];

            if (selectedChannel === "all") {
                // Combine videos from all channels
                channelVideos = Object.values(baseVideos).flatMap((videos) => Object.values(videos));
            } else if (baseVideos[selectedChannel]) {
                // Get videos from the selected channel
                channelVideos = Object.values(baseVideos[selectedChannel]);
            }

            // Filter videos by user
            const userFiltered = channelVideos.filter((video) =>
                video.Poster === selectedUser || selectedUser === null
            );

            // Sorting toggle (true for ascending, false for descending)
            const newestFirst = true; // Replace with your state or variable

            // Sort the filtered videos by `Date` in the specified order
            const sortedVideos = userFiltered.sort((a, b) => {
                const timestampA = new Date(a.Date);
                const timestampB = new Date(b.Date);

                // Flip sorting based on `isAscending`
                return newestFirst
                    ? timestampB - timestampA // Descending
                    : timestampA - timestampB; // Ascending
            });

            setFilteredVideos(sortedVideos);
        };

        applyFilters();
    }, [baseVideos, selectedChannel, selectedUser]);


    // Get # of clips per poster
    const posterCounts = useMemo(() => {
        if (!filteredVideos || filteredVideos.length <= 0) return {};

        return filteredVideos.reduce((acc, item) => {
            acc[item.Poster] = (acc[item.Poster] || 0) + 1;
            return acc;
        }, {});
    }, [filteredVideos]);


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

    // Fetch runtimes json data
    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}runtime_data.json`)
            .then((response) => response.json())
            .then((data) => {
                setRuntimes(data)
                setRuntimesLoading(false);
            })
            .catch((error) => console.error("Error loading runtimes:", error));
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
    if (videosLoading || iconsLoading || runtimesLoading) {
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
                            key={video.Id}
                            video={video}
                            userIcons={userIcons[selectedChannel]}
                            selectedUser={selectedUser}
                            channelId={selectedChannel}
                            runtime={runtimes[selectedChannel][video.Id]}
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
