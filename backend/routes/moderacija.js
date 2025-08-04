const express = require('express');
const moderacija = express.Router();
const DB = require('../DB/dbConn');
const { requireModerator, requireSuperAdmin, USER_ROLES } = require('../middleware/roleAuth');

// Get pending contributions for moderation
moderacija.get('/pending', requireModerator, async (req, res) => {
    try {
        const pendingContributions = await DB.getPendingContributions();
        res.json({
            success: true,
            data: pendingContributions
        });
    } catch (error) {
        console.error('Error fetching pending contributions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending contributions'
        });
    }
});

// Approve contribution
moderacija.post('/approve/:id', requireModerator, async (req, res) => {
    try {
        const { id } = req.params;
        const { moderatorNotes } = req.body;
        
        await DB.updateContributionStatus(id, 'approved', moderatorNotes);
        
        res.json({
            success: true,
            message: 'Contribution approved successfully'
        });
    } catch (error) {
        console.error('Error approving contribution:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving contribution'
        });
    }
});

// Reject contribution
moderacija.post('/reject/:id', requireModerator, async (req, res) => {
    try {
        const { id } = req.params;
        const { moderatorNotes } = req.body;
        
        await DB.updateContributionStatus(id, 'rejected', moderatorNotes);
        
        res.json({
            success: true,
            message: 'Contribution rejected successfully'
        });
    } catch (error) {
        console.error('Error rejecting contribution:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting contribution'
        });
    }
});

// Delete unwanted contribution (permanent removal)
moderacija.delete('/delete/:id', requireModerator, async (req, res) => {
    try {
        const { id } = req.params;
        
        // In a real app, you might want to soft-delete or archive instead
        await DB.query('DELETE FROM Prispevek WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Contribution deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contribution:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting contribution'
        });
    }
});

// Get all users (for user management)
moderacija.get('/users', requireModerator, async (req, res) => {
    try {
        const users = await DB.allUsers();
        // Remove sensitive information
        const sanitizedUsers = users.map(user => ({
            id: user.id,
            ime: user.ime,
            priimek: user.priimek,
            email: user.email,
            vloga: user.vloga,
            created_at: user.created_at
        }));
        
        res.json({
            success: true,
            data: sanitizedUsers
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// Update user role (SuperAdmin only)
moderacija.put('/users/:id/role', requireSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { newRole } = req.body;
        
        // Validate role
        const validRoles = Object.values(USER_ROLES);
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }
        
        await DB.updateUserRole(id, newRole);
        
        res.json({
            success: true,
            message: `User role updated to ${newRole}`
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user role'
        });
    }
});

// Get moderation statistics
moderacija.get('/stats', requireModerator, async (req, res) => {
    try {
        // This would require additional database queries
        const stats = {
            pendingCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
            totalUsers: 0
        };
        
        // You would implement these queries based on your database schema
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching moderation stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

module.exports = moderacija;
