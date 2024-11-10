import React, { useState } from 'react';
import './videoitem.css';
import './userselector.css';

function formatUserName(str) {
    const output = str.replace(/_/g, '');
    return output.charAt(0).toUpperCase() + output.slice(1);
}

function UserSelector({ userIcons, selectedUser, setSelectedUser, channel }) {
    const handleUserSelect = (user) => {
        if (selectedUser === user) {
            setSelectedUser(null);
        } else {
            setSelectedUser(user);
        }
    };

    return (
        <div className="player-selector">
            {Object.keys(userIcons).length > 0 && channel ? (
                Object.keys(userIcons[channel]).map((key) => (
                    <UserButton
                        key={key}
                        user={key}
                        icon={userIcons[channel][key]}
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
            <div className="author-icon" >
                {icon && <img src={icon} alt={`${user}'s avatar`} />}
            </div>
            {formatUserName(user)}
        </button>
    );
}

export default UserSelector;
