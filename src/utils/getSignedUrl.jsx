export const getSignedUrl = async (endpoint, devFallback) => {
    if (import.meta.env.MODE === "development") {
        // console.log(`Development mode detected. Using fallback: ${devFallback}`);
        return devFallback;
    }

    try {
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(`Failed to fetch signed URL: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.url) {
            throw new Error("Response does not contain a 'url' field.");
        }

        return data.url;
    } catch (error) {
        console.error("Error fetching signed URL:", error);
        return null;
    }
};
