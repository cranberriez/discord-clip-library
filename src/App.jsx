// src/App.jsx
import React, { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import Login from './routes/Login';
import Main from './routes/Main';

/**
 * The top-level App component now acts as a "Router" that decides
 * whether the user sees the <Login /> page or the <MainApp /> page.
 */
function App() {
    const [loggedUserInfo, setLoggedUserInfo] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        // Attempt to fetch the currently logged-in user info
        // (You may change this URL to match your Flask endpoint, e.g. /me)
        const fetchLoggedUserData = async () => {
            try {
                const response = await fetch('/me');
                if (response.ok) {
                    const data = await response.json();
                    setLoggedUserInfo(data);
                } else {
                    // Not logged in, or request failed
                    setLoggedUserInfo(null);
                }
            } catch (error) {
                console.error('Error fetching logged user data:', error);
                setLoggedUserInfo(null);
            } finally {
                setLoadingAuth(false);
            }
        };

        fetchLoggedUserData();
    }, []);

    if (loadingAuth) {
        return (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2>Checking authentication...</h2>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* 
          If user is logged in, go to Main.
          Otherwise, go to Login.
        */}
                <Route
                    path="/login"
                    element={
                        loggedUserInfo
                            ? <Navigate to="/" replace />
                            : <Login />
                    }
                />

                {/* <Route
                    path="/*"
                    element={
                        loggedUserInfo
                            ? <Main loggedUserInfo={loggedUserInfo} />
                            : <Navigate to="/login" replace />
                    }
                /> */}

                <Route
                    path="/*"
                    element={
                        <Main loggedUserInfo={loggedUserInfo} />
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
