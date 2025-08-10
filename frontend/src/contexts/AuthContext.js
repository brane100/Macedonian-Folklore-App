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

    const checkAuthStatus = useCallback(async () => {
        console.log('🔍 Checking auth status...');
        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CHECK_AUTH), {
                method: 'GET',
                credentials: 'include', // Important for session cookies
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('📡 Auth check response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📋 Auth check response data:', data);
                
                if (data.isAuthenticated && data.user) {
                    setIsAuthenticated(true);
                    setUser(data.user);
                    console.log('✅ User authenticated:', data.user.ime);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                    console.log('❌ User not authenticated');
                }
            } else {
                console.log('⚠️ Auth check response not ok:', response.status);
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('💥 Error checking auth status:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Check auth status on mount and when app regains focus
    useEffect(() => {
        checkAuthStatus();
        
        // Re-check auth when window gains focus (handles browser refresh)
        const handleFocus = () => {
            console.log('🔄 Window focused, rechecking auth...');
            checkAuthStatus();
        };
        
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
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
            
            // Redirect to login page after logout
            window.location.href = '/prijava';
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout fails, clear local state and redirect
            setIsAuthenticated(false);
            setUser(null);
            window.location.href = '/prijava';
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
