function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatUsername(username) {
    if (!username) return username

    if (username.includes("Deleted User#0000")) return "Arshy"
    return capitalizeFirstLetter(username.replace(/_/g, ''))
}

function formatDate(unixTimestamp) {
    // Ensure the timestamp is in milliseconds
    const timestampMs = unixTimestamp.toString().includes('.')
        ? Math.floor(unixTimestamp * 1000)
        : unixTimestamp;

    const date = new Date(timestampMs);

    if (isNaN(date)) {
        console.warn('Invalid Unix timestamp:', unixTimestamp);
        return 'Unknown Date'; // Fallback for invalid timestamps
    }

    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTitle(title) {
    let output = capitalizeFirstLetter(
        title.replace(".DVR_-_Trim", "")
            .replace("DVR", "")
            .replace("_-_Made_with_Clipchamp", "")
            .replace(/_/g, " ")
            .replace(/\./g, "")
            .replace(/-/g, "")
            .replace(/\d/g, "")
    )
    if (output.length > 1) return output
    else return "No Title"
}

function formatChannelName(channelName) {
    if (!channelName) return
    if (channelName == "all") return "all"


    return channelName
        .toLowerCase()
        .replace(/ /g, "-")

}

function formatTime(seconds) {
    if (!seconds) return null

    // Determine the total number of hours, minutes, and seconds
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        // Format as HH:MM:SS
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds.toFixed(0)).padStart(2, '0')}`;
    } else {
        // Format as MM:SS
        return `${String(minutes).padStart(1, '0')}:${String(remainingSeconds.toFixed(0)).padStart(2, '0')}`;
    }
}

// Configuration for the stringToHex Function
const config = {
    saturation: 80, // Base saturation (80-100% by default)
    lightness: 55,  // Base lightness (50-60% by default)
    satRange: 10,   // Slight variation range for saturation
    lightRange: 15   // Slight variation range for lightness
};

function stringToHex(str) {
    // Configuration defaults
    const { saturation = 80, lightness = 55, satRange = 15, lightRange = 10 } = config;

    // Step 1: Hash the string into a single number
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
    }

    // Step 2: Generate HSL values
    const hue = Math.abs(hash % 360); // Ensures hue is in 0-360 range
    const sat = saturation + (Math.abs(hash % satRange)); // Slight variation in saturation
    const light = lightness + (Math.abs(hash % lightRange)); // Slight variation in lightness

    // Step 3: Convert HSL to Hex
    return hslToHex(hue, sat, light);
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export {
    capitalizeFirstLetter,
    formatUsername,
    formatDate,
    formatTitle,
    formatChannelName,
    formatTime,
    stringToHex
};