import { useCallback, useRef, useEffect } from 'react';

export const usePosterCountsFactory = (baseVideos) => {
    const cacheRef = useRef({}); // Cache to store computed results

    useEffect(() => {
        // Clear cache when baseVideos changes to ensure fresh calculations
        cacheRef.current = {};
    }, [baseVideos]);

    const calculatePosterCounts = useCallback(
        (selectedChannel) => {
            if (!baseVideos) return {};

            // Collect all videos if selectedChannel is "all" or filter by channel
            const combinedVideos =
                selectedChannel === "all"
                    ? Object.values(baseVideos)
                    : Object.values(baseVideos).filter(video => video.channelId === selectedChannel);

            // Calculate poster counts
            const counts = combinedVideos.reduce((acc, item) => {
                const poster = item.Poster || "Unknown";
                acc[poster] = (acc[poster] || 0) + 1;
                return acc;
            }, {});

            // Cache the result for the selected channel
            cacheRef.current[selectedChannel] = counts;

            return counts;
        },
        [baseVideos]
    );

    return calculatePosterCounts;
};
