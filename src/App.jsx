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
    const [runtimesLoading, setRuntimesLoading] = useState(true);

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
        setPage(0)
    }, [baseVideos, selectedChannel, selectedUser]);

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

    // Handle infinite scroll with dynamic buffer
    useEffect(() => {
        const handleScroll = debounce(() => {
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
    }, [filteredVideos, paginatedVideos]); // Add necessary dependencies

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
                        CHANNELS={CHANNELS} selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel}
                        userIcons={userIcons} selectedUser={selectedUser} setSelectedUser={setSelectedUser} getPosterCounts={getPosterCounts}
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
