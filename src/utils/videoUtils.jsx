function isExpired(expiredDate) {
    const currentTime = new Date();
    const expirationTime = new Date(expiredDate);
    return expirationTime < currentTime;
}

export {
    isExpired
}