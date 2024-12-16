import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { formatChannelName, formatUsername } from './utils/formatUtils';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faFilm, faHeart, faGear, faArrowRightFromBracket, faAt, faHashtag, faSliders } from '@fortawesome/free-solid-svg-icons';
import { SettingsMenuIcon, SearchIcon, NoEyeIcon } from '@vidstack/react/icons';

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

    const selectedUserName = formatUsername(selectedUser ?? "All Users")
    const selectedChannelName = formatChannelName(CHANNELS[selectedChannel]?.name ?? selectedChannel);
    const posterCounts = getPosterCounts(selectedChannel);
    const totalClipCount = Object.values(posterCounts).reduce((sum, count) => sum + count, 0);

    const navItemLeft = useRef(null);
    const [leftWidth, setLeftWidth] = useState(0);

    // Navbar Constants
    const menus = [
        { component: <ChannelSelector /> },
        { component: <AuthorSelector /> },
        { component: <FilterSelector /> },
        { component: <Searchbar /> },
    ]

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

    useEffect(() => {
        if (!(selectedUser in posterCounts)) setSelectedUser(null);
    }, [posterCounts, selectedUser, selectedChannel]);

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

    // Function to update the left column's width
    const updateWidth = () => {
        if (navItemLeft.current) {
            setLeftWidth(navItemLeft.current.offsetWidth);
        }
    };

    // UseEffect to handle initial load and window resize
    useEffect(() => {
        updateWidth();
        window.addEventListener('resize', updateWidth);

        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    return (
        <NavbarProvider value={contextValue}>
            <div
                className={`nav-container`}
                style={{
                    '--author-count': Object.keys(userIcons).length,
                    '--channel-count': Object.keys(CHANNELS).length,
                }}
            >
                <UserMenu reference={navItemLeft} />
                <MainMenu />
                <div
                    className='RIGHT-FILLER-ITEM'
                    style={{ width: `${leftWidth}px` }}
                >
                </div>
            </div>
        </NavbarProvider>
    );
}

// USER MENU
function UserMenu() {
    const { isUserVisible, setIsUserVisible, reference } = useNavbarContext();

    const handleMouseEnter = () => {
        setIsUserVisible(true)
    }

    const handleMouseLeave = () => {
        setIsUserVisible(false)
    }

    return (
        <div
            className={`nav-element nav-usermenu ${isUserVisible ? 'menu-visible' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={reference}
        >
            <MenuButton iconUrl={faBars} />
            <UserButton />

            {isUserVisible && <UserMenuDropdown />}
        </div>
    )
}

function MenuButton({ iconUrl }) {
    return (
        <div className='nav-piece nav-button'>
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

function UserButton() {
    return (
        <div className='nav-piece user-piece'>
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
    const { activeMenu, setActiveMenu, selectedUserName, selectedChannelName, menus } = useNavbarContext();

    const handleNavSelect = (navItem) => {
        if (navItem == activeMenu) {
            setActiveMenu(null)
        }
        else {
            setActiveMenu(navItem)
        }
    }

    return (
        <div className='nav-element nav-mainmenu'>
            <ChannelMenu clickEvent={handleNavSelect} selectedChannelName={selectedChannelName} />
            <AuthorMenu clickEvent={handleNavSelect} selectedUserName={selectedUserName} />
            <div className='nav-piece nav-button' onClick={() => handleNavSelect(2)} >
                <SettingsMenuIcon size={40} />
            </div>
            <div className='nav-piece nav-button' onClick={() => handleNavSelect(3)} >
                <SearchIcon size={40} />
            </div>

            {activeMenu != null && <div className='nav-mm-subnav-cont'>
                {menus?.[activeMenu].component}
            </div>}
        </div>
    )
}

function ChannelMenu({ clickEvent, selectedChannelName }) {
    return (
        <div className='nav-piece nav-channel-button nav-icon-text' id='channel-nav-cont' onClick={() => clickEvent(0)}>
            <FontAwesomeIcon icon={faHashtag} />
            <p>{selectedChannelName}</p>
        </div>
    )
}

function AuthorMenu({ clickEvent, selectedUserName }) {
    return (
        <div className='nav-piece nav-author-button nav-icon-text' id='author-nav-cont' onClick={() => clickEvent(1)}>
            <FontAwesomeIcon icon={faAt} />
            <p>{selectedUserName}</p>
        </div>
    )
}

function ChannelSelector() {
    const { CHANNELS } = useNavbarContext();
    // console.log(Object.entries(CHANNELS)) // Debugging

    return (
        <div className='nav-channels-selector'>
            <p>Channel Selector</p>
            <div className='nav-channels-container'>
                <ChannelItem channelID={"all"} channelInfo={{ name: "all" }} />
                {Object.entries(CHANNELS).map((channel) => {
                    const channelID = channel[0]
                    const channelInfo = channel[1]
                    return (
                        <ChannelItem key={channelID} channelID={channelID} channelInfo={channelInfo} />
                    )
                })}
            </div>
        </div>
    )
}

function ChannelItem({ channelID, channelInfo }) {
    const { selectedChannel, setSelectedChannel } = useNavbarContext();
    // console.log(selectedChannel, channelID, selectedChannel === channelID) // Debugging

    return (
        <div
            className={`nav-channels-item ${channelID === selectedChannel ? 'active-channel' : ''}`}
            onClick={() => setSelectedChannel(channelID)}
        >
            {channelInfo.name}
        </div>
    )
}

function AuthorSelector() {
    return (
        <div className='nav-author-selector'>
            Author Selector
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
