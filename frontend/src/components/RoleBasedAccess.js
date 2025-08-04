import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// User roles
export const USER_ROLES = {
    GUEST: 'gost',
    USER: 'navaden', 
    MODERATOR: 'komisija',
    SUPERADMIN: 'superadmin'
};

// Role hierarchy
const ROLE_HIERARCHY = {
    [USER_ROLES.GUEST]: 0,
    [USER_ROLES.USER]: 1,
    [USER_ROLES.MODERATOR]: 2,
    [USER_ROLES.SUPERADMIN]: 3
};

// Check if user has required role or higher
export const hasRequiredRole = (userRole, requiredRole) => {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole];
    return userLevel >= requiredLevel;
};

// Higher-order component for role-based access
export const withRoleAccess = (WrappedComponent, requiredRole, fallbackComponent = null) => {
    return function RoleProtectedComponent(props) {
        const { user, isAuthenticated } = useAuth();
        
        if (!isAuthenticated) {
            return <Navigate to="/prijava" replace />;
        }
        
        const userRole = user?.vloga || USER_ROLES.GUEST;
        
        if (!hasRequiredRole(userRole, requiredRole)) {
            if (fallbackComponent) {
                return fallbackComponent;
            }
            return (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem',
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '8px',
                    margin: '2rem'
                }}>
                    <h3>🚫 Недостатни дозволи</h3>
                    <p>Немате дозвола за пристап до оваа страна.</p>
                    <p>Потребна улога: <strong>{requiredRole}</strong></p>
                    <p>Ваша улога: <strong>{userRole}</strong></p>
                </div>
            );
        }
        
        return <WrappedComponent {...props} />;
    };
};

// Component for conditional rendering based on roles
export const RoleGuard = ({ children, requiredRole, fallback = null }) => {
    const { user, isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return fallback;
    }
    
    const userRole = user?.vloga || USER_ROLES.GUEST;
    
    if (!hasRequiredRole(userRole, requiredRole)) {
        return fallback;
    }
    
    return children;
};

// Specific role guard components
export const ModeratorGuard = ({ children, fallback = null }) => (
    <RoleGuard requiredRole={USER_ROLES.MODERATOR} fallback={fallback}>
        {children}
    </RoleGuard>
);

export const SuperAdminGuard = ({ children, fallback = null }) => (
    <RoleGuard requiredRole={USER_ROLES.SUPERADMIN} fallback={fallback}>
        {children}
    </RoleGuard>
);

export const UserGuard = ({ children, fallback = null }) => (
    <RoleGuard requiredRole={USER_ROLES.USER} fallback={fallback}>
        {children}
    </RoleGuard>
);

// Hook for role checking
export const useRole = () => {
    const { user, isAuthenticated } = useAuth();
    const userRole = user?.vloga || USER_ROLES.GUEST;
    
    return {
        userRole,
        isAuthenticated,
        hasRole: (requiredRole) => hasRequiredRole(userRole, requiredRole),
        isModerator: hasRequiredRole(userRole, USER_ROLES.MODERATOR),
        isSuperAdmin: hasRequiredRole(userRole, USER_ROLES.SUPERADMIN),
        isUser: hasRequiredRole(userRole, USER_ROLES.USER)
    };
};
