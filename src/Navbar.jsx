import React, { useEffect, useState } from 'react';
import './css/Navbar.css';

function formatChannelName(channelName) {
    if (!channelName) return
    if (channelName == "all") return "# all"


    return "# " + channelName
        .toLowerCase()
        .replace(/ /g, "-")

}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatUsername(username) {
    if (username.includes("Deleted User#0000")) return "Arshy"
    return capitalizeFirstLetter(username.replace(/_/g, ''))
}

function Navbar({ CHANNELS, selectedChannel, setSelectedChannel, userIcons, selectedUser, setSelectedUser, getPosterCounts }) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const selectedChannelName = formatChannelName(CHANNELS[selectedChannel]?.name ?? selectedChannel)
    const posterCounts = getPosterCounts(selectedChannel);
    const totalClipCount = Object.values(posterCounts).reduce((sum, count) => sum + count, 0);

    const flattenUserData = (data) => {
        return Object.values(data).reduce((acc, channel) => {
            for (const [user, url] of Object.entries(channel)) {
                acc[user] = url;
            }
            return acc;
        }, {});
    };

    useEffect(() => {
        if (!(selectedUser in posterCounts)) setSelectedUser(null)
    }, [posterCounts, selectedUser, selectedChannel])

    const handleChannelSelect = (channel) => {
        setSelectedChannel(channel)
    }

    const handleUserSelect = (user) => {
        if (selectedUser === user) {
            setSelectedUser(null);
        } else {
            setSelectedUser(user);
        }
    };

    const showMenu = () => setIsMenuVisible(true);
    const hideMenu = () => setIsMenuVisible(false);

    return (
        <div className='app-navbar'>
            <div className='navbar-inner-cont'>
                <div className='nav-prev-cont'
                    onMouseEnter={showMenu}
                    onMouseLeave={hideMenu}
                >
                    <div className='nav-channel-prev'>
                        <p className='active-channel-prev'>{selectedChannelName}</p>
                    </div>

                    <div className='nav-author-prev'>
                        <AuthorPreviewIcons flatUserIcons={flattenUserData(userIcons)} selectedUser={selectedUser} />
                    </div>

                    <div className='nav-total-prev'>
                        <p>{(selectedUser ? posterCounts[selectedUser] : totalClipCount) || 0} {((selectedUser ? posterCounts[selectedUser] : totalClipCount) || 0) == 1 ? "Clip" : "Clips"}</p>
                    </div>
                </div>
                {isMenuVisible && <div className='nav-filters-cont'
                    onMouseEnter={showMenu}
                    onMouseLeave={hideMenu}
                >
                    <div className='nav-filters-channels'>
                        <p className='filter-label'>Channel</p>
                        <button
                            key={"all-channel-selector123"}
                            className={`filter-channel ${"all" === selectedChannel ? 'active' : ''}`}
                            onClick={() => { handleChannelSelect("all") }}
                        >
                            {formatChannelName("all")}
                        </button>
                        {Object.entries(CHANNELS).map(([channelId, { name }]) => (
                            <button
                                key={channelId}
                                className={`filter-channel ${channelId === selectedChannel ? 'active' : ''}`}
                                onClick={() => { handleChannelSelect(channelId) }}
                            >
                                {formatChannelName(name)}
                            </button>
                        ))}
                    </div>
                    <div className='nav-filters-authors'>
                        <p className='filter-label'>Poster</p>
                        <div className='filter-author-cont'>
                            {Object.entries(flattenUserData(userIcons)).map(([name, src]) => (
                                <button
                                    key={name}
                                    className={`filter-author ${name === selectedUser ? 'active' : ''}`}
                                    onClick={() => { handleUserSelect(name) }}
                                    disabled={!posterCounts[name]}
                                >
                                    <div className="author-icon">
                                        {src && <img
                                            src={src}
                                            alt={`${name}'s icon`}
                                        />}
                                    </div>
                                    <div>
                                        <p className='filter-author-name'>{formatUsername(name)}</p>
                                        <p className='filter-author-clips'>{posterCounts[name] || 0} {(posterCounts[name] || 0) == 1 ? "Clip" : "Clips"}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>}
            </div>
        </div>
    )
}

function AuthorPreviewIcons({ flatUserIcons, selectedUser }) {
    // Render Single Author
    if (selectedUser !== null) {
        const src = flatUserIcons[selectedUser]
        return (
            <div className='prev-single-author'>
                <div className="author-icon single" key={"prev-" + selectedUser}>
                    {src && (
                        <img
                            src={src}
                            alt={`${selectedUser}'s icon`}
                        />
                    )}
                </div>
                <p>
                    {formatUsername(selectedUser)}
                </p>
            </div>
        );
    }

    return (
        <>
            {flatUserIcons && Object.entries(flatUserIcons).map(([name, src]) => (
                <div className="author-icon" key={"prev-" + name}>
                    {src && (
                        <img
                            src={src}
                            alt={`${name}'s icon`}
                        />
                    )}
                </div>
            ))}
        </>
    );
}


export default Navbar;