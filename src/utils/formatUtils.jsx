function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatUsername(username) {
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

export {
    capitalizeFirstLetter,
    formatUsername,
    formatDate,
    formatTitle,
    formatChannelName,
    formatTime
};