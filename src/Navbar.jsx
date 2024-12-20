import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { formatChannelName, formatUsername, stringToHex, formatFilterName, intToHexColor } from './utils/formatUtils';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faFilm, faHeart, faGear, faArrowRightFromBracket, faAt, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { SettingsMenuIcon, SearchIcon, XMarkIcon, ChevronDownIcon, TimerIcon } from '@vidstack/react/icons';

import './css/Navbar.css';

const NavbarContext = createContext();

const NavbarProvider = ({ children, value }) => (
    <NavbarContext.Provider value={value}>
        {children}
    </NavbarContext.Provider>
)

const useNavbarContext = () => useContext(NavbarContext);

function Navbar({ loggedUserInfo, filterManager, CHANNELS, selectedChannel, setSelectedChannel, userIcons, selectedUser, setSelectedUser, getPosterCounts }) {
    // Navbar state
    const [isUserVisible, setIsUserVisible] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [divWidth, setDivWidth] = useState(0);

    // Searchbar State
    const [searchValue, setSearchValue] = useState('');

    const selectedUserName = formatUsername(selectedUser) ?? "everyone"
    const selectedChannelName = formatChannelName(CHANNELS[selectedChannel]?.name ?? selectedChannel);
    const posterCounts = getPosterCounts(selectedChannel);
    const totalClipCount = Object.values(posterCounts).reduce((sum, count) => sum + count, 0);

    const navItemLeft = useRef(null);
    const [rightWidth, setRightWidth] = useState(0);
    const navbarRef = useRef(null);

    // Navbar Constants
    const menus = {
        "channel": { component: <ChannelSelector /> },
        "author": { component: <AuthorSelector /> },
        "filter": { component: <FilterSelector /> },
        "search": { component: <Searchbar /> },
        "settings": { component: <Settings /> }
    }

    // Close menus if clicking outside
    useEffect(() => {
        const handleDocumentClick = (e) => {
            // Ignore clicks on elements with the `data-ignore-click` attribute
            if (e.target.closest('[data-ignore-click]')) {
                return;
            }
            else {
                setActiveMenu(null);
                setIsUserVisible(false);
            }

            // // Close menus if clicking outside the navbar
            // if (navbarRef.current && !navbarRef.current.contains(e.target)) {
            //     setActiveMenu(null);
            //     setIsUserVisible(false);
            // }
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
        filterManager,
        loggedUserInfo,
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
        setSelectedUser,
        // Searchbar
        searchValue,
        setSearchValue
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
                <ModifiedFilterChips />
            </div>
        </NavbarProvider>
    );
}

function ModifiedFilterChips() {
    const { activeMenu, filterManager } = useNavbarContext();

    const chipIcons = {
        "Search": (<SearchIcon size={24} />),
        "DateRange": (<TimerIcon size={24} />),
        "Expired": (<TimerIcon size={24} />)
    }

    const modifiedFilters = filterManager.getChangedFilters();

    return (
        <>
            {!["filter", "search"].includes(activeMenu) && <div className='modified-filters-container'>
                {Object.entries(modifiedFilters).map(([key, value]) =>
                (
                    <div className='modified-filter-chip'>
                        {
                            chipIcons?.[key] ?? <></>
                        }
                        <p>{formatFilterName(value)}</p>
                        <button
                            className='reset-modified-filter'
                            onClick={() => filterManager.resetFilter(key)}
                        >
                            <XMarkIcon size={18} />
                        </button>
                    </div>
                )
                )}
            </div>}
        </>
    )
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
            data-ignore-click
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
            <FontAwesomeIcon icon={iconUrl} />
        </div>
    )
}

function UserButton({ toggleUserMenu }) {
    const { loggedUserInfo } = useNavbarContext();

    const user = loggedUserInfo.user
    const avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    const displayName = user.global_name || user.username;
    const userColor = intToHexColor(user.accent_color)
    const bannerColor = user.banner_color

    return (
        <div className='nav-piece user-piece' onClick={() => toggleUserMenu()}>
            <div className='nav-user-dtls'>
                <p className='nav-lia'>Logged In As</p>
                <p
                    className='nav-liu'
                >
                    {displayName}
                </p>
            </div>
            <div className='nav-user-icon-cont'
                style={{
                    backgroundColor: `${userColor}80`
                }}
            >
                <img src={avatarURL} />
            </div>
        </div>
    )
}

function UserMenuDropdown() {
    return (
        <div className='num-dropdown'>
            <ul>
                <UMDropdownItem iconUrl={faFilm} text={"Your Videos"} menuId={"myVideos"}> </UMDropdownItem>
                <UMDropdownItem iconUrl={faHeart} text={"Liked Videos"} > </UMDropdownItem>
                <UMDropdownItem iconUrl={faGear} text={"Settings"} menuId={"settings"}> </UMDropdownItem>
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
        <div className='nav-element nav-mainmenu' data-ignore-click >
            <ChannelMenu clickEvent={handleNavSelect} selectedChannelName={selectedChannelName} />

            <AuthorMenu clickEvent={handleNavSelect} selectedUserName={selectedUserName} />

            <div className={`nav-piece nav-button ${activeMenu === "filter" ? 'active' : ''}`} onClick={() => handleNavSelect("filter")} >
                <SettingsMenuIcon size={40} />
            </div>

            <div className={`nav-piece nav-button ${activeMenu === "search" ? 'active' : ''}`} onClick={() => handleNavSelect("search")} >
                <SearchIcon size={40} />
            </div>
        </div>
    )
}

function MenuCloseButton() {
    const { activeMenu, setActiveMenu } = useNavbarContext();

    const handleClose = () => {
        if (activeMenu) {
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
        <div
            className={`nav-piece nav-channel-button nav-icon-text ${activeMenu === "channel" ? 'active' : ''}`}
            id='channel-nav-cont' onClick={() => clickEvent("channel")} data-ignore-click
        >
            <FontAwesomeIcon icon={faHashtag} />
            <p>{selectedChannelName}</p>
        </div>
    )
}

function AuthorMenu({ clickEvent, selectedUserName }) {
    const { activeMenu } = useNavbarContext();

    return (
        <div
            className={`nav-piece nav-channel-button nav-icon-text ${activeMenu === "author" ? 'active' : ''}`}
            id='author-nav-cont' onClick={() => clickEvent("author")} data-ignore-click
        >
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
        <div className='nav-submenu-container' data-ignore-click >
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
        <div className='nav-submenu-container' data-ignore-click >
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
            setSelectedUser(null)
        }
        else {
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
    const { filterManager } = useNavbarContext();
    const curDateFilter = filterManager.getCurrentFilterState("Date");

    const dateRangeStatus = formatFilterName(filterManager.getCurrentFilterState("DateRange")) ?? "All Time"
    const expiredStatus = formatFilterName(filterManager.getCurrentFilterState("Expired")) ?? "Include Expired"

    const handleFilterChange = (filterName, filterValue) => {
        filterManager.setFilter(filterName, filterValue);
    };

    return (
        <div className="nav-submenu-container" data-ignore-click>
            <div className="nav-filter-selector">
                {/* Date Order Filtering */}
                <div
                    className={`specific-filter-item ${curDateFilter === "newest" ? "active" : ""
                        }`}
                    onClick={() => handleFilterChange("Date", "newest")}
                >
                    Newest
                </div>
                <div
                    className={`specific-filter-item ${curDateFilter === "oldest" ? "active" : ""
                        }`}
                    onClick={() => handleFilterChange("Date", "oldest")}
                >
                    Oldest
                </div>

                <div className="specific-filter-divider"></div>

                {/* Date Range Filter */}
                <div className="specific-filter-item filter-dropping" >
                    <div className='filter-status'>{dateRangeStatus} <ChevronDownIcon size={12} /></div>
                    <div className="filter-dropdown-menu" >
                        <div className="filter-dropdown-item" onClick={() => handleFilterChange("DateRange", "past_week")}>Past Week</div>
                        <div className="filter-dropdown-item" onClick={() => handleFilterChange("DateRange", "past_month")}>Past Month</div>
                        <div className="filter-dropdown-item" onClick={() => handleFilterChange("DateRange", "past_year")}>Past Year</div>
                        <div className="filter-dropdown-item" onClick={() => handleFilterChange("DateRange", null)}>All Time</div>
                    </div>
                </div>

                {/* Expired Filter */}
                <div className={`specific-filter-item filter-dropping`} >
                    <div className='filter-status'>{expiredStatus} <ChevronDownIcon size={12} /></div>
                    <div className="filter-dropdown-menu" >
                        <div className="filter-dropdown-item" onClick={() => handleFilterChange("Expired", null)}>Include Expired</div>
                        <div className="filter-dropdown-item" onClick={() => handleFilterChange("Expired", "hide_expired")}>Hide Expired</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// function Searchbar() {
//     return (
//         <div className='nav-submenu-container' data-ignore-click >
//             <div className='nav-Searchbar'>
//                 Searchbar
//             </div>
//         </div>
//     )
// }

function Searchbar() {
    const { filterManager, searchValue, setSearchValue } = useNavbarContext();


    const clearSearch = () => {
        setSearchValue("")
        filterManager.setFilter("Search", null)
    }

    const onSearch = (query) => {
        if (query.length === 0) {
            filterManager.setFilter("Search", null);
        } else {
            filterManager.setFilter("Search", query);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(searchValue);
        }, 300); // 500ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchValue]);

    return (
        <div className='nav-submenu-container searchbar-container' data-ignore-click>
            <div className='nav-searchbar'>
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search..."
                />
                <button
                    className={`${searchValue ? "active" : ""}`}
                    onClick={() => clearSearch()}
                >
                    Clear
                </button>
            </div>
        </div>
    );
}

function Settings() {
    return (<></>)
}

export default Navbar;
