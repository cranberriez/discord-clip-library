import { useEffect, useState } from "react";
import { getSignedUrl } from "./getSignedUrl";

const usePosterPath = (vidId, isPosterVisible, urlCache) => {
    const [posterPath, setPosterPath] = useState(null);

    useEffect(() => {
        if (!isPosterVisible || !vidId) return;

        if (urlCache.has(vidId)) {
            // Use the cached URL
            setPosterPath(urlCache.get(vidId));
        } else {
            // Fetch and cache the URL
            const fetchUrl = async () => {
                try {
                    const url = await getSignedUrl(
                        `/discord-clip-library/thumb/${vidId}.png`,
                        `${import.meta.env.BASE_URL}thumb/${vidId}.png`
                    );
                    if (url) {
                        urlCache.set(vidId, url); // Cache the URL
                        setPosterPath(url);
                    }
                } catch (error) {
                    console.error("Error fetching signed URL:", error);
                }
            };

            fetchUrl();
        }
    }, [isPosterVisible, vidId, urlCache]);

    return posterPath;
};

export default usePosterPath;
