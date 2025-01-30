import React, { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useNavigate
} from 'react-router-dom';

import Login from './routes/Login';
import Home from './routes/Home';

function App() {
    const [loggedUserInfo, setLoggedUserInfo] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const fetchLoggedUserData = async () => {
            try {
                const response = await fetch('/api/me');
                if (response.ok) {
                    const data = await response.json();
                    setLoggedUserInfo(data);
                } else {
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

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
            });
            if (response.ok) {
                setLoggedUserInfo(null); // Clear the logged-in user info
            } else {
                console.error('Logout failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

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
                <Route
                    path="/login"
                    element={
                        loggedUserInfo
                            ? <Navigate to="/" replace />
                            : <Login />
                    }
                />
                <Route
                    path="/*"
                    element={
                        loggedUserInfo
                            ? <Home loggedUserInfo={loggedUserInfo} onLogout={handleLogout} />
                            : <Navigate to="/login" replace />
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;