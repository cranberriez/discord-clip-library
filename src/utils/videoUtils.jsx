function isExpired(expiredTimestamp) {
    const currentTime = new Date();
    const expirationTime = expiredTimestamp * 1000; // expiredTimestamp comes in as a unix timestamp
    return expirationTime < currentTime;
}

export {
    isExpired
}