// src/Login.jsx
import React from 'react';

/**
 * Simple placeholder login page
 */
function Login() {

    const handleLogin = () => {
        // 1. Redirect to your Flask OAuth flow, e.g.:
        // window.location.href = "http://localhost:5000/auth/login";
        //
        // or
        // 2. Call some login endpoint, e.g. fetch('/login') 
        //    that sets an auth cookie, etc.
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
