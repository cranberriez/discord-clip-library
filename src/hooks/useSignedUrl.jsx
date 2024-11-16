import { useEffect, useState } from "react";
import { getSignedUrl } from "../utils/getSignedUrl";

const useSignedUrl = (id, dir, urlCache) => {
    const [signedUrl, setSignedUrl] = useState(null);

    useEffect(() => {
        if (!id || !dir) return;

        const cacheKey = `${dir}/${id}`; // Unique key for caching based on directory and ID

        if (urlCache.has(cacheKey)) {
            // Use the cached URL
            setSignedUrl(urlCache.get(cacheKey));
        } else {
            // Fetch and cache the URL
            const fetchUrl = async () => {
                try {
                    const url = await getSignedUrl(
                        `/discord-clip-library/${dir}/${id}`,
                        `${import.meta.env.BASE_URL}${dir}/${id}`
                    );
                    if (url) {
                        urlCache.set(cacheKey, url); // Cache the URL
                        setSignedUrl(url);
                    }
                } catch (error) {
                    console.error("Error fetching signed URL:", error);
                }
            };

            fetchUrl();
        }
    }, [id, dir, urlCache]);

    return signedUrl;
};

export default useSignedUrl;
