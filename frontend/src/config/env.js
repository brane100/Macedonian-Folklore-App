// Environment configuration utility
// This file centralizes all environment variable access

// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    ENDPOINTS: {
        LOGIN: '/uporabnik/login',
        LOGOUT: '/uporabnik/logout',
        REGISTER: '/uporabnik/register',
        CHECK_AUTH: '/uporabnik/check-auth',
        SESSION: '/uporabnik/session'
    }
};

// App Configuration
export const APP_CONFIG = {
    NAME: process.env.REACT_APP_APP_NAME || 'Macedonian Folklore App',
    NODE_ENV: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || 'development',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production'
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper to check if all required environment variables are present
export const validateEnvironment = () => {
    const required = ['REACT_APP_API_URL'];
    const missing = required.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
        console.warn('Missing environment variables:', missing);
        console.warn('Using default values. Create a .env file with these variables for production.');
    }
    
    return missing.length === 0;
};

// Initialize environment validation
validateEnvironment();
