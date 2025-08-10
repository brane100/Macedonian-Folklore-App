import { useState, useEffect } from 'react';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/uporabnik/check-auth`, {
                credentials: 'include' // Important for session cookies
            });
            const data = await response.json();
            setIsAuthenticated(data.isAuthenticated);
            setUser(data.user);
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/uporabnik/logout`, {
                credentials: 'include'
            });
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkAuthStatus
    };
};

export default useAuth;
