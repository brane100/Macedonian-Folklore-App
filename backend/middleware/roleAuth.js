// Role-based authorization middleware

// User roles hierarchy
const USER_ROLES = {
    GUEST: 'gost',
    USER: 'navaden', 
    MODERATOR: 'komisija',
    SUPERADMIN: 'superadmin'
};

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
    [USER_ROLES.GUEST]: 0,
    [USER_ROLES.USER]: 1,
    [USER_ROLES.MODERATOR]: 2,
    [USER_ROLES.SUPERADMIN]: 3
};

// Check if user has required role or higher
function hasRequiredRole(userRole, requiredRole) {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole];
    return userLevel >= requiredLevel;
}

// Middleware factory for role-based access control
function requireRole(requiredRole) {
    return async (req, res, next) => {
        // First check if user is authenticated
        if (!req.session || !req.session.logged_in) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required',
                redirectTo: '/prijava'
            });
        }

        // Get user role from session or database
        let userRole = req.session.user_role;
        
        // If role not in session, fetch from database
        if (!userRole && req.session.email) {
            try {
                const DB = require('../DB/dbConn');
                const user = await DB.authUser(req.session.email);
                if (user && user.vloga) {
                    userRole = user.vloga;
                    req.session.user_role = userRole; // Cache in session
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
                return res.status(500).json({ 
                    success: false,
                    message: 'Internal server error'
                });
            }
        }

        // Check if user has required role
        if (!hasRequiredRole(userRole, requiredRole)) {
            return res.status(403).json({ 
                success: false,
                message: 'Insufficient permissions',
                required: requiredRole,
                current: userRole
            });
        }

        // Add user info to request for use in routes
        req.user = {
            role: userRole,
            email: req.session.email
        };

        next();
    };
}

// Specific role middleware functions
const requireUser = requireRole(USER_ROLES.USER);
const requireModerator = requireRole(USER_ROLES.MODERATOR);
const requireSuperAdmin = requireRole(USER_ROLES.SUPERADMIN);

module.exports = {
    USER_ROLES,
    ROLE_HIERARCHY,
    hasRequiredRole,
    requireRole,
    requireUser,
    requireModerator,
    requireSuperAdmin
};
