import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

    const handleLogin = () => {
        // Redirect to Flask's /authorize route to start the OAuth flow
        window.location.href = "/authorize";
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h1>Please Log In</h1>
            <button onClick={handleLogin}>
                Log In with Discord (or whichever provider)
            </button>
        </div>
    );
}

export default Login;