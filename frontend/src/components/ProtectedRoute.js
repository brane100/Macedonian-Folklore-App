import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component that requires authentication
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                fontSize: '18px'
            }}>
                Се вчитува... 🔄
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/prijava" replace />;
};

// Component that should redirect authenticated users (like login/register pages)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                fontSize: '18px'
            }}>
                Се вчитува... 🔄
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/" replace />;
};

export { ProtectedRoute, PublicRoute };
