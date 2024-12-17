import React, { useEffect, useState, useMemo, useRef } from 'react';
import { usePosterCountsFactory } from './hooks/usePosterCountsFactory';
import VideoItem from './VideoItem';
import VideoPlayer from './VideoPlayer';
import Navbar from './Navbar';
import './css/App.css';
import { throttle } from 'lodash';
import debounce from 'lodash.debounce';

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
    const itemsPerPage = 50;
    const isDevelopment = import.meta.env.MODE === 'development';

    const [showLoader, setShowLoader] = useState(true);

    // Videos and filtering state
    const [baseVideos, setBaseVideos] = useState({});
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [runtimes, setRuntimes] = useState({});
    const [selectedChannel, setSelectedChannel] = useState("all");

    // User data state
    const [userIcons, setUserIcons] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);

    // Loading states
    const [videosLoading, setVideosLoading] = useState(true);
    const [iconsLoading, setIconsLoading] = useState(true);
    const [runtimesLoading, setRuntimesLoading] = useState(false);

    // Current playing video / skip to video
    const [activeVideo, setActiveVideo] = useState(null);
    const [lastActiveVideo, setLastActiveVideo] = useState(null);
    const [clipId, setClipId] = useState(null);

    // Track visible videos
    const [visibleVideos, setVisibleVideos] = useState({});
    const [page, setPage] = useState(null);

    const videoGridRef = useRef(null);
    const appRef = useRef(null);
    const scrollPosition = useRef(0);


    // Helper functions
    const getPosterCounts = usePosterCountsFactory(baseVideos);
    const urlCache = useMemo(() => new Map(), []);

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

    const getPageForVideo = (videoId) => {
        const index = filteredVideos.findIndex(video => video.Id === videoId);
        return Math.floor(index / itemsPerPage);
    };

    // Data fetching
    // User Data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const url = isDevelopment
                    ? '/discord-clip-library/userdata.json'
                    : '/discord-clip-library/userdata';

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch user data: ${response.statusText}`);
                }

                const data = await response.json();
                setUserIcons(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setIconsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Message Data
    useEffect(() => {
        const fetchAllMessages = async () => {
            try {
                const url = isDevelopment
                    ? '/discord-clip-library/messages.json'
                    : '/discord-clip-library/messages';

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch messages: ${response.statusText}`);
                }

                const data = await response.json();
                setBaseVideos(data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setVideosLoading(false);
            }
        };

        fetchAllMessages();
    }, []);

    // Video filtering and pagination
    useEffect(() => {
        if (!baseVideos) return;

        const applyFilters = () => {
            const allVideos = Object.values(baseVideos);

            const channelFiltered = selectedChannel === "all"
                ? allVideos
                : allVideos.filter((video) => video.channelId === selectedChannel);

            const userFiltered = selectedUser
                ? channelFiltered.filter((video) => video.Poster === selectedUser)
                : channelFiltered;

            const sortedVideos = userFiltered.sort((a, b) => b.Date - a.Date);

            setFilteredVideos(sortedVideos);
            setPage(0);
        };

        applyFilters();
    }, [baseVideos, selectedChannel, selectedUser]);

    // Scroll prevention when video active
    useEffect(() => {
        const appRoot = appRef.current;

        if (activeVideo) {
            setLastActiveVideo(activeVideo)

            if (appRoot) {
                scrollPosition.current = appRoot.scrollTop;
                appRoot.classList.add('no-scroll');
            }
        } else if (!activeVideo && scrollPosition.current) {
            if (appRoot) {
                appRoot.scrollTo(0, scrollPosition.current);
                appRoot.classList.remove('no-scroll');
            }
        }

        return () => {
            if (appRoot) {
                appRoot.classList.remove('no-scroll');
            }
        };
    }, [activeVideo]);

    // Scroll handling for setting page
    useEffect(() => {
        const attachScrollListener = () => {
            const currentApp = appRef.current;

            if (!currentApp) return;

            const handleScroll = debounce(() => {
                if (activeVideo) return;

                const { scrollTop, scrollHeight, clientHeight } = currentApp;

                if (
                    scrollTop + clientHeight >= scrollHeight - 300 &&
                    (page + 1) * itemsPerPage < filteredVideos.length
                ) {
                    setPage((prevPage) => prevPage + 1);
                }
            }, 200);

            currentApp.addEventListener('scroll', handleScroll);

            return () => {
                currentApp.removeEventListener('scroll', handleScroll);
            };
        };

        // Attach immediately if `appRef` is ready
        if (appRef.current) {
            attachScrollListener();
        } else {
            // Retry attaching if `appRef` isn't ready
            const interval = setInterval(() => {
                if (appRef.current) {
                    attachScrollListener();
                    clearInterval(interval);
                }
            }, 100); // Retry every 100ms
        }
    }, [filteredVideos, page, activeVideo]);

    // URL Query parameters
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const queryClip = params.get('clip');
        const queryChan = params.get('chan');

        if (queryChan) {
            setSelectedChannel(String(queryChan));
        }

        if (queryClip && queryChan) {
            setClipId(queryClip);
            console.log("both set: ", queryClip, queryChan)
        }
    }, []);

    // Setting activeVideo when clipID and selectedChannel are set
    // these are set from query params
    useEffect(() => {
        if (clipId && selectedChannel && filteredVideos.length > 0) {
            const targetVideo = filteredVideos.find((video) => video.Id === clipId);

            if (targetVideo) {
                setActiveVideo(targetVideo);
                setClipId(null);
            } else {
                console.warn("Clip ID not found in filtered videos:", clipId);
            }
        }
    }, [clipId, selectedChannel, filteredVideos]);

    // Visibility tracking
    useEffect(() => {
        const observer = new IntersectionObserver(
            throttle((entries) => {
                const updatedVisibility = {};
                entries.forEach((entry) => {
                    updatedVisibility[entry.target.dataset.id] = entry.isIntersecting;
                });
                setVisibleVideos((prev) => ({ ...prev, ...updatedVisibility }));
            }, 100),
            { root: videoGridRef.current, threshold: 0.1 }
        );

        if (videoGridRef.current) {
            videoGridRef.current.childNodes.forEach((child) =>
                observer.observe(child)
            );
        }

        return () => {
            if (videoGridRef.current) {
                videoGridRef.current.childNodes.forEach((child) =>
                    observer.unobserve(child)
                );
            }
        };
    }, []);

    // Loader fade-out
    useEffect(() => {
        if (!videosLoading && !iconsLoading && !runtimesLoading) {
            const timeout = setTimeout(() => setShowLoader(false), 400);
            return () => clearTimeout(timeout);
        }
    }, [videosLoading, iconsLoading, runtimesLoading]);

    return (
        <>
            {showLoader &&
                <div className={`content-loading ${!videosLoading && !iconsLoading && !runtimesLoading ? 'fade-out' : ''}`}>
                    <img src="./imgs/s.gif" alt="Loading..." />
                    <h1>Loading content</h1>
                </div>
            }
            {!showLoader &&
                <div className="App" id="App" ref={appRef}>
                    <div className='app-navbar-cont'>
                        <Navbar
                            userIcons={userIcons}
                            CHANNELS={CHANNELS} selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel}
                            selectedUser={selectedUser} setSelectedUser={setSelectedUser} getPosterCounts={getPosterCounts}
                        />
                    </div>

                    <div ref={videoGridRef} className="video-grid">
                        {filteredVideos.length > 0 ? (
                            filteredVideos.slice(0, (page + 1) * itemsPerPage).map((video) => (
                                <VideoItem
                                    key={video.Id}
                                    video={video}
                                    userIcons={userIcons}
                                    selectedUser={selectedUser}
                                    channelId={selectedChannel}
                                    runtimes={runtimes}
                                    clipId={clipId}
                                    onClick={setActiveVideo} // Set active video when clicked
                                    urlCache={urlCache}
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
                            urlCache={urlCache}
                        />
                    )}
                </div>}
        </>
    );
}

export default App;
