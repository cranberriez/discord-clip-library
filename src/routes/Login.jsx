import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

import "../css/Login.css";

function Login() {
    const navigate = useNavigate();
    const [hover, setHover] = useState(false);

    const handleLogin = () => {
        window.location.href = "/authorize"; // Start OAuth
    };

    return (
        <div className="login-container">
            <h1>Welcome!</h1>
            <p>Log in to continue</p>
            <button
                className="discord-login"
                onClick={handleLogin}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{ transform: hover ? "scale(1.05)" : "scale(1)" }}
            >
                <FontAwesomeIcon icon={faDiscord} className="discord-icon" />
                Log in with Discord
            </button>
        </div>
    );
}

export default Login;
