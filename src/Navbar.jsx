import React, { useEffect, useState, useRef } from 'react';
import { formatChannelName, formatUsername } from './utils/formatUtils';
import { ChevronDownIcon, XMarkIcon } from '@vidstack/react/icons';
import './css/Navbar.css';

function Navbar({ isMenuVisible, setIsMenuVisible, CHANNELS, selectedChannel, setSelectedChannel, userIcons, selectedUser, setSelectedUser, getPosterCounts }) {
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [divWidth, setDivWidth] = useState(0);
    const authorPrevRef = useRef(null);

    const selectedChannelName = formatChannelName(CHANNELS[selectedChannel]?.name ?? selectedChannel);
    const posterCounts = getPosterCounts(selectedChannel);
    const totalClipCount = Object.values(posterCounts).reduce((sum, count) => sum + count, 0);

    useEffect(() => {
        if (!(selectedUser in posterCounts)) setSelectedUser(null);
    }, [posterCounts, selectedUser, selectedChannel]);

    const handleChannelSelect = (channel) => {
        setSelectedChannel(channel);
    };

    // Touch screen detection
    useEffect(() => {
        const checkTouchDevice = () => {
            setIsTouchDevice(
                'ontouchstart' in window || navigator.maxTouchPoints > 0
            );
        };

        checkTouchDevice();
        window.addEventListener('resize', checkTouchDevice);
        return () => {
            window.removeEventListener('resize', checkTouchDevice);
        };
    }, []);

    // Width update handle for the Author Preview Container
    useEffect(() => {
        const updateWidth = () => {
            if (authorPrevRef.current) {
                setDivWidth(authorPrevRef.current.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);

        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    const handleUserSelect = (user) => {
        setSelectedUser(selectedUser === user ? null : user);
    };

    const toggleMenu = () => setIsMenuVisible((prev) => !prev);

    return (
        <div
            className={`app-navbar ${isMenuVisible ? 'nav-open' : ''}`}
            style={{
                '--author-count': Object.keys(userIcons).length,
                '--channel-count': Object.keys(CHANNELS).length,
            }}
        >
            <div className="navbar-inner-cont">
                <div
                    className="nav-prev-cont"
                    {...(!isTouchDevice
                        ? {
                            onMouseEnter: () => setIsMenuVisible(true),
                            onMouseLeave: () => setIsMenuVisible(false),
                        }
                        : { onClick: toggleMenu })}
                >
                    <div className="nav-channel-prev">
                        <p className="active-channel-prev">{selectedChannelName}</p>
                    </div>

                    <div className="nav-author-prev" ref={authorPrevRef}>
                        <AuthorPreviewIcons userIcons={userIcons} selectedUser={selectedUser} divWidth={divWidth} />
                    </div>

                    <div className="nav-total-prev">
                        <p>
                            {(selectedUser ? posterCounts[selectedUser] : totalClipCount) || 0}{' '}
                            {((selectedUser ? posterCounts[selectedUser] : totalClipCount) || 0) === 1 ? 'Clip' : 'Clips'}
                        </p>
                    </div>

                    <button
                        className={`close-navbar ${isTouchDevice ? '' : 'hide-close-button'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu();
                        }}
                    >
                        <OpenCloseButton open={isMenuVisible} />
                    </button>
                </div>

                {isMenuVisible && (
                    <div
                        className="nav-filters-cont"
                        {...(!isTouchDevice && {
                            onMouseEnter: () => setIsMenuVisible(true),
                            onMouseLeave: () => setIsMenuVisible(false),
                        })}
                    >
                        <div className="nav-filters-channels">
                            <p className="filter-label">Channel</p>
                            <div className="filter-channels-cont">
                                <button
                                    key="all-channel-selector123"
                                    className={`filter-channel ${'all' === selectedChannel ? 'active' : ''}`}
                                    onClick={() => handleChannelSelect('all')}
                                >
                                    {formatChannelName('all')}
                                </button>
                                {Object.entries(CHANNELS).map(([channelId, { name }]) => (
                                    <button
                                        key={channelId}
                                        className={`filter-channel ${channelId === selectedChannel ? 'active' : ''}`}
                                        onClick={() => handleChannelSelect(channelId)}
                                    >
                                        {formatChannelName(name)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="nav-filters-authors">
                            <p className="filter-label">Poster</p>
                            <div className="filter-author-cont">
                                {Object.entries(userIcons).map(([name, { Url }]) => (
                                    <button
                                        key={name}
                                        className={`filter-author ${name === selectedUser ? 'active' : ''}`}
                                        onClick={() => handleUserSelect(name)}
                                        disabled={!posterCounts[name]}
                                    >
                                        <div className="author-icon">
                                            {Url && <img src={Url} alt={`${name}'s icon`} />}
                                        </div>
                                        <div className="filter-author-text">
                                            <p className="filter-author-name">{formatUsername(name)}</p>
                                            <p className="filter-author-clips">
                                                {posterCounts[name] || 0}{' '}
                                                {(posterCounts[name] || 0) === 1 ? 'Clip' : 'Clips'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function AuthorPreviewIcons({ userIcons, selectedUser, divWidth }) {
    const [iconCount, setIconCount] = useState(1);
    const iconWidth = 34;

    useEffect(() => {
        if (divWidth > iconWidth * Object.keys(userIcons).length) {
            setIconCount(undefined);
        } else {
            setIconCount(Math.floor(divWidth / iconWidth));
        }
    }, [divWidth]);

    if (selectedUser !== null) {
        const { Url } = userIcons[selectedUser] || {};
        return (
            <div className="prev-single-author">
                <div className="author-icon single" key={`prev-${selectedUser}`}>
                    {Url && <img src={Url} alt={`${selectedUser}'s icon`} />}
                </div>
                <p>{formatUsername(selectedUser)}</p>
            </div>
        );
    }

    return (
        <>
            {Object.entries(userIcons)
                .slice(0, iconCount)
                .map(([name, { Url }]) => (
                    <div className="author-icon" key={`prev-${name}`}>
                        {Url && <img src={Url} alt={`${name}'s icon`} />}
                    </div>
                ))}
        </>
    );
}

function OpenCloseButton({ open }) {
    return (
        <div className={`open-close-svgs ${open ? 'open' : ''}`}>
            {open ? <XMarkIcon size={40} /> : <ChevronDownIcon className="oc-svg first-chev" size={40} />}
        </div>
    );
}

export default Navbar;
