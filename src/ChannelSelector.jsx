import React, { useState } from 'react';
import "./channelselector.css"

function ChannelSelector({ CHANNELS, channel, setChannel }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionClick = (channelId) => {
        setChannel(channelId);
        setIsOpen(false); // Close the dropdown when an option is selected
    };

    console.log(channel)

    return (
        <div className="channel-selector">
            <div
                id="select-button"
                className="brd"
                onClick={() => setIsOpen(!isOpen)} // Toggle options visibility
            >
                <div id="selected-value">
                    <span>{CHANNELS[channel].name}</span>
                </div>
                <div id="chevrons">
                    <i className="fas fa-chevron-up"></i>
                    <i className="fas fa-chevron-down"></i>
                </div>
            </div>
            {isOpen && (
                <div id="options">
                    {Object.entries(CHANNELS).map(([id, { name }]) => (
                        <div
                            className="option"
                            key={id}
                            onClick={() => handleOptionClick(id)}
                        >
                            <input
                                type="radio"
                                name="platform"
                                checked={channel === id}
                                readOnly
                            />
                            <span className="label">{name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ChannelSelector;
