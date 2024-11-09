import React, { useState } from 'react';
import './VideoItem.css';
import './UserIcons.css';

function formatUserName(str) {
    const output = str.replace(/_/g, '');
    return output.charAt(0).toUpperCase() + output.slice(1);
}

function UserSelector({ userIcons, selectedUser, setSelectedUser }) {
    const handleUserSelect = (user) => {
        if (selectedUser === user) {
            setSelectedUser(null);
        } else {
            setSelectedUser(user);
        }
    };

    return (
        <div className="player-selector">
            {Object.keys(userIcons).length > 0 ? (
                Object.keys(userIcons).map((key) => (
                    <UserButton
                        key={key}
                        user={key}
                        icon={userIcons[key]}
                        onClick={() => handleUserSelect(key)}
                        active={key === selectedUser}
                    />
                ))
            ) : (
                <p>Loading Users...</p>
            )}
        </div>
    );
}

function UserButton({ user, icon, onClick, active }) {
    return (
        <button
            className={`player ${active ? 'active' : ''}`}
            onClick={onClick}
        >
            <img className="author-icon" src={icon} alt={`${user}'s avatar`} />
            {formatUserName(user)}
        </button>
    );
}

export default UserSelector;
