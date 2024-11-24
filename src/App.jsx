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
    const [showLoader, setShowLoader] = useState(true);

    // Navbar state
    const [isMenuVisible, setIsMenuVisible] = useState(false);

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
    const [clipId, setClipId] = useState(null);

    // Signed Url Cache for video thumbnails
    const urlCache = useMemo(() => new Map(), []);

    // Track visible videos
    const [visibleVideos, setVisibleVideos] = useState({});
    const videoGridRef = useRef(null);

    // Poster counts
    // Get # of clips per poster
    const getPosterCounts = usePosterCountsFactory(baseVideos);

    // Video List Pagination
    const [paginatedVideos, setPaginatedVideos] = useState([]);
    const [page, setPage] = useState(0);
    const itemsPerPage = 100;

    const isDevelopment = import.meta.env.MODE === 'development';

    // Fetch user icons JSON data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const url = isDevelopment
                    ? '/discord-clip-library/userdata.json' // Append `.json` in dev
                    : '/discord-clip-library/userdata'; // Use direct API call in production

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch user data: ${response.statusText}`);
                }

                const data = await response.json();
                setUserIcons(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setIconsLoading(false); // Stop loading even if it fails
            } finally {
                setIconsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchAllMessages = async () => {
            try {
                const url = isDevelopment
                    ? '/discord-clip-library/messages.json' // Append `.json` in dev
                    : '/discord-clip-library/messages'; // Use direct API call in production

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch messages: ${response.statusText}`);
                }

                const data = await response.json();
                console.log(data)
                setBaseVideos(data);
            } catch (error) {
                console.error("Error fetching messages:", error);
                setVideosLoading(false); // Stop loading even if it fails
            } finally {
                setVideosLoading(false);
            }
        };

        fetchAllMessages();
    }, []);

    // Filter basevideos using selected channel and selected user
    useEffect(() => {
        if (!baseVideos) return;

        const applyFilters = () => {
            // Get all videos from baseVideos as an array
            const allVideos = Object.values(baseVideos);

            // Filter by selected channel if not "all"
            const channelFiltered = selectedChannel === "all"
                ? allVideos
                : allVideos.filter((video) => video.channelId === selectedChannel);

            // Further filter by selected user if specified
            const userFiltered = selectedUser
                ? channelFiltered.filter((video) => video.Poster === selectedUser)
                : channelFiltered;

            // Sort videos by `Date` (newest first by default)
            const sortedVideos = userFiltered.sort((a, b) => b.Date - a.Date);

            // Update filtered videos and reset the page
            setFilteredVideos(sortedVideos);
            setPage(0);
        };

        applyFilters();
    }, [baseVideos, selectedChannel, selectedUser, setFilteredVideos, setPage]);

    // Set clipId to activeVideo
    useEffect(() => {
        if (activeVideo) {
            setClipId(activeVideo.Id)
        }
    }, [activeVideo]);

    // Prevent scroll on root when video is selected
    // Declare useRef to store the scroll position
    const scrollPosition = useRef(0);

    // Save scroll position when opening VideoPlayer
    useEffect(() => {
        const appRoot = document.getElementById('root');

        if (activeVideo) {
            // Save current scroll position and lock scroll
            scrollPosition.current = document.documentElement.scrollTop || document.body.scrollTop;
            appRoot.classList.add('no-scroll');
        } else if (!activeVideo && scrollPosition.current) {
            // Restore scroll position only when closing the player
            window.scrollTo(0, scrollPosition.current);
            appRoot.classList.remove('no-scroll');
        }

        return () => {
            appRoot.classList.remove('no-scroll'); // Ensure cleanup when `clipId` is unset
        };
    }, [activeVideo]);

    // Get and Set Query Params if they exist
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const queryClip = params.get('clip');
        const queryChan = params.get('chan');

        if (queryChan) {
            setSelectedChannel(String(queryChan));
        }

        if (queryClip && queryChan) {
            // Store the query clip temporarily until videos are filtered
            setClipId(queryClip);
        }
    }, []);

    // Watch for selectedChannel and clipId updates to set the active video
    useEffect(() => {
        if (clipId && selectedChannel) {
            // Wait for filteredVideos to contain the clipId video
            const targetVideo = filteredVideos.find((video) => video.Id === clipId);

            if (targetVideo) {
                setActiveVideo(targetVideo);
                setClipId(null)
            }
        }
    }, [clipId, selectedChannel, filteredVideos]);

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

    // Fade Loader when content has finished loading
    useEffect(() => {
        if (!videosLoading && !iconsLoading && !runtimesLoading) {
            // Delay removal of loader to allow fade-out animation
            const timeout = setTimeout(() => setShowLoader(false), 500); // Match CSS transition duration
            return () => clearTimeout(timeout); // Cleanup timeout
        }
    }, [videosLoading, iconsLoading, runtimesLoading]);

    // Intersection observer for videos in videogrid
    useEffect(() => {
        const observer = new IntersectionObserver(
            throttle((entries) => {
                const updatedVisibility = {};
                entries.forEach((entry) => {
                    updatedVisibility[entry.target.dataset.id] = entry.isIntersecting;
                });
                setVisibleVideos((prev) => ({ ...prev, ...updatedVisibility }));
            }, 100), // Throttle updates to once every 100ms
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

    // Declare useRef at the top level
    const lastScrollTop = useRef(0);
    const lastTimestamp = useRef(Date.now());

    // Update paginatedVideos whenever filteredVideos or page changes
    useEffect(() => {
        const newVideos = filteredVideos.slice(0, (page + 1) * itemsPerPage);
        setPaginatedVideos(newVideos);
    }, [filteredVideos, page]);

    // Infinite scroll with dynamic buffer and active video check
    useEffect(() => {
        const handleScroll = debounce(() => {
            // Exit early if a video is currently active
            if (activeVideo) return;

            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

            // Calculate dynamic buffer based on scroll speed
            const currentTimestamp = Date.now();
            const timeDelta = currentTimestamp - lastTimestamp.current;
            const scrollDelta = Math.abs(scrollTop - lastScrollTop.current);

            const scrollSpeed = scrollDelta / timeDelta; // Pixels per millisecond
            const dynamicBuffer = Math.min(500, 300 + scrollSpeed * 100); // Adjust values as needed

            // Trigger pagination when near the bottom with the dynamic buffer
            if (
                scrollTop + clientHeight >= scrollHeight - dynamicBuffer &&
                paginatedVideos.length < filteredVideos.length
            ) {
                setPage((prevPage) => prevPage + 1);
            }

            // Update refs for the next calculation
            lastScrollTop.current = scrollTop;
            lastTimestamp.current = currentTimestamp;
        }, 200); // Adjust debounce delay for smoother scrolling

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [filteredVideos, paginatedVideos, activeVideo]); // Add `activeVideo` as a dependency


    return (
        <>
            {showLoader &&
                <div className={`content-loading ${!videosLoading && !iconsLoading && !runtimesLoading ? 'fade-out' : ''}`}>
                    <img src="./imgs/s.gif" alt="Loading..." />
                    <h1>Loading content</h1>
                </div>
            }
            {!showLoader &&
                <div className="App">
                    <Navbar
                        isMenuVisible={isMenuVisible} setIsMenuVisible={setIsMenuVisible} userIcons={userIcons}
                        CHANNELS={CHANNELS} selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel}
                        selectedUser={selectedUser} setSelectedUser={setSelectedUser} getPosterCounts={getPosterCounts}
                    />

                    <div ref={videoGridRef} className="video-grid">
                        {paginatedVideos.length > 0 ? (
                            paginatedVideos.map((video) => (
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
