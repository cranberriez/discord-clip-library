import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { formatChannelName, formatUsername, stringToHex } from './utils/formatUtils';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faFilm, faHeart, faGear, faArrowRightFromBracket, faAt, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { SettingsMenuIcon, SearchIcon, XMarkIcon } from '@vidstack/react/icons';

import './css/Navbar.css';

const NavbarContext = createContext();

const NavbarProvider = ({ children, value }) => (
    <NavbarContext.Provider value={value}>
        {children}
    </NavbarContext.Provider>
)

const useNavbarContext = () => useContext(NavbarContext);

function Navbar({ CHANNELS, selectedChannel, setSelectedChannel, userIcons, selectedUser, setSelectedUser, getPosterCounts }) {
    // Navbar state
    const [isUserVisible, setIsUserVisible] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [divWidth, setDivWidth] = useState(0);

    const selectedUserName = formatUsername(selectedUser) ?? "everyone"
    const selectedChannelName = formatChannelName(CHANNELS[selectedChannel]?.name ?? selectedChannel);
    const posterCounts = getPosterCounts(selectedChannel);
    const totalClipCount = Object.values(posterCounts).reduce((sum, count) => sum + count, 0);

    const navItemLeft = useRef(null);
    const [rightWidth, setRightWidth] = useState(0);
    const navbarRef = useRef(null);

    // Navbar Constants
    const menus = [
        { component: <ChannelSelector /> },
        { component: <AuthorSelector /> },
        { component: <FilterSelector /> },
        { component: <Searchbar /> },
    ]

    // Close menus if clicking outside
    useEffect(() => {
        const handleDocumentClick = (e) => {
            if (navbarRef.current && !navbarRef.current.contains(e.target)) {
                setActiveMenu(null);
                setIsUserVisible(false);
            }
        };

        document.addEventListener("click", handleDocumentClick);

        return () => {
            document.removeEventListener("click", handleDocumentClick);
        };
    }, []);

    // Something lol idk
    useEffect(() => {
        if (!(selectedUser in posterCounts)) {
            setSelectedUser(null);
        }
    }, [posterCounts, selectedUser, selectedChannel]);

    // Function to update the right empty column's width
    const updateWidth = () => {
        if (navItemLeft.current) {
            setRightWidth(navItemLeft.current.offsetWidth);
        }
    };

    const checkTouchDevice = () => {
        setIsTouchDevice(
            'ontouchstart' in window || navigator.maxTouchPoints > 0
        );
    };

    const onResize = () => {
        checkTouchDevice();
        updateWidth();
        console.log(rightWidth)
    }

    // UseEffect to handle initial load and window resize
    useEffect(() => {
        window.addEventListener('resize', onResize);

        checkTouchDevice();
        updateWidth();

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    const authorCount = Object.keys(userIcons).length;
    const authorCountSqrt = Math.round(Math.sqrt(authorCount)) + 1
    const channelCount = Object.keys(CHANNELS).length;
    const channelCountSqrt = Math.round(Math.sqrt(channelCount))

    // Context Available Vars
    const contextValue = {
        // Created State / Consts
        isUserVisible,
        setIsUserVisible,
        activeMenu,
        setActiveMenu,
        selectedUserName,
        selectedChannelName,
        posterCounts,
        menus,
        // Passed State
        CHANNELS,
        selectedChannel,
        setSelectedChannel,
        userIcons,
        selectedUser,
        setSelectedUser
    }

    return (
        <NavbarProvider value={contextValue}>
            <div className='fixed-nav-container' ref={navbarRef}>
                <div className={`nav-container`} >
                    <UserMenu reference={navItemLeft} />
                    <MainMenu />
                    <div
                        className='RIGHT-FILLER-ITEM'
                        style={{ width: `${rightWidth}px` }}
                    >
                    </div>
                </div>
                {activeMenu != null &&
                    <div className='subnav-container'
                        style={{
                            '--author-count': authorCount,
                            '--author-count-sqrt': authorCountSqrt,
                            '--channel-count': channelCount,
                            '--channel-count-sqrt': channelCountSqrt
                        }}
                    >
                        {menus?.[activeMenu].component}
                    </div>}
            </div>
        </NavbarProvider>
    );
}

// USER MENU
function UserMenu({ reference }) {
    const { isUserVisible, setIsUserVisible, setActiveMenu } = useNavbarContext();

    const handleToggleMenu = () => {
        setActiveMenu(null)
        setIsUserVisible((prev) => !prev)
    }

    return (
        <div
            className={`nav-element nav-usermenu ${isUserVisible ? 'menu-visible' : ''}`}
            ref={reference}
        >
            <MenuButton iconUrl={faBars} toggleUserMenu={handleToggleMenu} />
            <UserButton toggleUserMenu={handleToggleMenu} />

            {isUserVisible && <UserMenuDropdown />}
        </div>
    )
}

function MenuButton({ iconUrl, toggleUserMenu }) {
    return (
        <div className='nav-piece nav-button' onClick={() => toggleUserMenu()}>
            <FontAwesomeIcon icon={iconUrl}
                style={{
                    stroke: 'black',
                    strokeWidth: 1,
                    fill: 'none', // Remove the default fill if needed
                }}
            />
        </div>
    )
}

function UserButton({ toggleUserMenu }) {
    return (
        <div className='nav-piece user-piece' onClick={() => toggleUserMenu()}>
            <div className='nav-user-dtls'>
                <p className='nav-lia'>Logged In As</p>
                <p className='nav-liu'>__jacob__</p>
            </div>
            <div className='nav-user-icon-cont'>
                <div className='nav-user-icon-dummy'>
                    ?
                </div>
            </div>
        </div>
    )
}

function UserMenuDropdown() {
    return (
        <div className='num-dropdown'>
            <ul>
                <UMDropdownItem iconUrl={faFilm} text={"Your Videos"}> </UMDropdownItem>
                <UMDropdownItem iconUrl={faHeart} text={"Liked Videos"} > </UMDropdownItem>
                <UMDropdownItem iconUrl={faGear} text={"Settings"} > </UMDropdownItem>
                <UMDropdownItem iconUrl={faArrowRightFromBracket} text={"Sign Out"} > </UMDropdownItem>
            </ul>
        </div>
    )
}

function UMDropdownItem({ iconUrl, text }) {
    return (
        <li className='num-item'>
            <FontAwesomeIcon icon={iconUrl} />
            <p>{text}</p>
        </li>
    )
}

// MAIN MENU
function MainMenu() {
    const { activeMenu, setActiveMenu, selectedUserName, selectedChannelName, menus, setIsUserVisible } = useNavbarContext();

    const handleNavSelect = (navItem) => {
        if (navItem == activeMenu) {
            setActiveMenu(null)
        }
        else {
            setIsUserVisible(false)
            setActiveMenu(navItem)
        }
    }

    return (
        <div className='nav-element nav-mainmenu'>
            <ChannelMenu clickEvent={handleNavSelect} selectedChannelName={selectedChannelName} />

            <AuthorMenu clickEvent={handleNavSelect} selectedUserName={selectedUserName} />

            <div className={`nav-piece nav-button ${activeMenu === 2 ? 'active' : ''}`} onClick={() => handleNavSelect(2)} >
                <SettingsMenuIcon size={40} />
            </div>

            <div className={`nav-piece nav-button ${activeMenu === 3 ? 'active' : ''}`} onClick={() => handleNavSelect(3)} >
                <SearchIcon size={40} />
            </div>
        </div>
    )
}

function MenuCloseButton() {
    const { activeMenu, setActiveMenu } = useNavbarContext();

    const handleClose = () => {
        if (activeMenu >= 0) {
            setActiveMenu(null)
        }
    }

    return (
        <div className='submenu-close-button' onClick={() => handleClose()}>
            <XMarkIcon size={24} />
        </div>
    )
}

function ChannelMenu({ clickEvent, selectedChannelName }) {
    const { activeMenu } = useNavbarContext();

    return (
        <div className={`nav-piece nav-channel-button nav-icon-text ${activeMenu === 0 ? 'active' : ''}`} id='channel-nav-cont' onClick={() => clickEvent(0)}>
            <FontAwesomeIcon icon={faHashtag} />
            <p>{selectedChannelName}</p>
        </div>
    )
}

function AuthorMenu({ clickEvent, selectedUserName }) {
    const { activeMenu } = useNavbarContext();

    return (
        <div className={`nav-piece nav-channel-button nav-icon-text ${activeMenu === 1 ? 'active' : ''}`} id='author-nav-cont' onClick={() => clickEvent(1)}>
            <FontAwesomeIcon icon={faAt} />
            <p>{selectedUserName}</p>
        </div>
    )
}

function ChannelSelector() {
    const { CHANNELS } = useNavbarContext();

    // Create an array from CHANNELS entries and sort it by name
    const sortedChannels = Object.entries(CHANNELS)
        .map(([channelID, channelInfo]) => ({ channelID, ...channelInfo })) // Map to an object array
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by 'name'

    return (
        <div className='nav-submenu-container'>
            <p className='nav-selector-title'>Channel Selector</p>
            <div className='nav-channels-selector'>
                {/* Static "all" channel */}
                <ChannelItem channelID={"all"} channelInfo={{ name: "all" }} />

                {/* Map the sorted channels */}
                {sortedChannels.map(({ channelID, name }) => (
                    <ChannelItem
                        key={channelID}
                        channelID={channelID}
                        channelInfo={{ name }}
                    />
                ))}
            </div>
            <MenuCloseButton />
        </div>
    );
}

function ChannelItem({ channelID, channelInfo }) {
    const { selectedChannel, setSelectedChannel } = useNavbarContext();
    // console.log(selectedChannel, channelID, selectedChannel === channelID) // Debugging
    const hashColor = stringToHex(channelInfo.name)
    const isAll = channelInfo.name == "all"
    const isSelected = (selectedChannel === channelID)

    return (
        <div
            className={`channels-item ${isSelected ? 'active' : ''}`}
            onClick={() => setSelectedChannel(channelID)}
        >
            <p>
                <span
                    className={`channel-hashtag ${isAll ? 'rainbow-text' : ''}`}
                    style={{
                        color: hashColor
                    }}
                ># </span>
                {formatChannelName(channelInfo.name)}
            </p>
        </div>
    )
}

function AuthorSelector() {
    const { userIcons } = useNavbarContext();

    const sortedUsers = Object.values(userIcons)
        .sort((a, b) => a.Name.localeCompare(b.Name));

    return (
        <div className='nav-submenu-container'>
            <p className='nav-selector-title'>Author Selector</p>
            <div className='nav-authors-selector'>
                {/* Map the sorted channels */}
                {sortedUsers.map(({ Name, Url }) => (
                    <AuthorItem
                        key={Name}
                        Name={Name}
                        Url={Url}
                    />
                ))}
            </div>
            <MenuCloseButton />
        </div>
    )
}

function AuthorItem({ Name, Url }) {
    const { selectedUser, setSelectedUser, posterCounts } = useNavbarContext();

    const isSelected = (selectedUser == Name)
    const hasPosts = (Name in posterCounts)
    const postCount = posterCounts?.[Name] ?? 0
    const postText = postCount === 1 ? "Clip" : "Clips"

    const handleSelectUser = () => {
        if (!hasPosts) return

        if (formatUsername(selectedUser) == formatUsername(Name)) {
            console.log("resetting user")
            console.log(selectedUser, Name)
            setSelectedUser(null)
        }
        else {
            console.log("setting user to", Name)
            console.log(selectedUser, Name)
            setSelectedUser(Name)
        }
    }

    return (
        <div className={`authors-item ${isSelected ? 'active' : ''} ${hasPosts ? '' : 'disabled'}`} onClick={handleSelectUser}>
            <div className='author-item-icon-cont'>
                <img className='author-item-icon' src={Url}></img>
            </div>
            <div className='author-details-cont'>
                <div className='author-item-name'>
                    {formatUsername(Name)}
                </div>
                <div className='author-item-posts'>
                    {postCount} {postText}
                </div>
            </div>
        </div>
    )
}

function FilterSelector() {
    return (
        <div className='nav-filter-selector'>
            Filter Selector
        </div>
    )
}

function Searchbar() {
    return (
        <div className='nav-Searchbar'>
            Searchbar
        </div>
    )
}

export default Navbar;
