import { useCallback, useRef } from 'react';

export const usePosterCountsFactory = (baseVideos) => {
    const cacheRef = useRef({}); // Cache to store computed results

    const calculatePosterCounts = useCallback(
        (selectedChannel) => {
            if (!baseVideos || !selectedChannel) return {};

            // Check the cache for the selected channel
            if (cacheRef.current[selectedChannel]) {
                return cacheRef.current[selectedChannel];
            }

            let combinedVideos = [];
            if (selectedChannel === "all") {
                // Combine all videos from all channels (convert objects of objects into arrays)
                combinedVideos = Object.values(baseVideos)
                    .map(channel => Object.values(channel)) // Convert channel objects into arrays
                    .flat();
            } else {
                combinedVideos = Object.values(baseVideos[selectedChannel] || {});
            }

            // Ensure combinedVideos is an array before reducing
            if (!Array.isArray(combinedVideos)) {
                console.error('Expected combinedVideos to be an array, got:', combinedVideos);
                return {};
            }

            // Calculate poster counts
            const counts = combinedVideos.reduce((acc, item) => {
                acc[item.Poster] = (acc[item.Poster] || 0) + 1;
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
