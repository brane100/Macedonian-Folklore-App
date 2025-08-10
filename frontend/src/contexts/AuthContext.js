import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { buildApiUrl, API_CONFIG } from '../config/env';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    const checkAuthStatus = useCallback(async () => {
        if (initialized) return; // Prevent multiple calls
        
        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CHECK_AUTH), {
                method: 'GET',
                credentials: 'include', // Important for session cookies
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(data.isAuthenticated);
                if (data.user) {
                    // Ensure we have the user role information
                    setUser({
                        ...data.user,
                        vloga: data.user.vloga || 'navaden' // Default role
                    });
                } else {
                    setUser(null);
                }
            } else {
                // If response is not ok, user is not authenticated
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, [initialized]);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
        setLoading(false);
    };

    const logout = async () => {
        try {
            setLoading(true);
            await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOGOUT), {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
