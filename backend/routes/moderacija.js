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

// 1 - odobren
// 2 - zavrnjen
// 3 - zahteva spremembe / arhiviran

// Approve contribution
moderacija.post('/approve/:id', requireModerator, async (req, res) => {
    try {
        const { id } = req.params;
        const { moderatorNotes } = req.body;
        
        await DB.updateContributionStatus(id, 'odobren');
        // get the user ID from session
        await DB.addRevision(id, req.session.user_id, 'odobreno', moderatorNotes);
        
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
        await DB.updateContributionStatus(id, 'zavrnjen');
        await DB.addRevision(id, req.session.user_id, 'zavrnjeno', moderatorNotes);

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

// Edit contribution directly (moderator action)
moderacija.put('/edit/:id', requireModerator, async (req, res) => {
    try {
        const { id } = req.params;
        const { opis, referenca_opis, referenca_url, moderatorNotes } = req.body;
        
        // Update the contribution
        await DB.updatePrispevek(id, opis, referenca_opis, referenca_url);
        
        // Add revision record for the edit
        await DB.addRevision(id, req.session.user_id, 'odobreno', 'Clan komisije z id ' + req.session.user_id + ' je spremenil vsebino prispevka: ' + moderatorNotes);
        await DB.updateContributionStatus(id, 'odobren'); // Set status to approved after edit

        res.json({
            success: true,
            message: 'Contribution updated successfully'
        });
    } catch (error) {
        console.error('Error editing contribution:', error);
        res.status(500).json({
            success: false,
            message: 'Error editing contribution'
        });
    }
});

// Request edits for contribution
moderacija.post('/request-edit/:id', requireModerator, async (req, res) => {
    try {
        const { id } = req.params;
        const { moderatorNotes } = req.body;
        
        if (!moderatorNotes || moderatorNotes.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Moderator notes are required when requesting edits'
            });
        }

        await DB.updateContributionStatus(id, 'arhiviran');
        await DB.addRevision(id, req.session.user_id, 'zahteva dopolnitev', moderatorNotes);
        res.json({
            success: true,
            message: 'Edit request sent successfully'
        });
    } catch (error) {
        console.error('Error requesting edits:', error);
        res.status(500).json({
            success: false,
            message: 'Error requesting edits'
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

// Delete user (SuperAdmin only)
moderacija.delete('/users/:id', requireSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`Attempting to delete user with ID: ${id}`);
        
        // Check if user exists first
        const user = await DB.getUserById(id);
        if (!user) {
            console.log(`User with ID ${id} not found`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Prevent deletion of the current superadmin (optional safety check)
        if (req.session.user_id == id) {
            console.log(`User ${id} tried to delete their own account`);
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }
        
        console.log(`Deleting user: ${user.ime} ${user.priimek} (${user.email})`);
        
        // Use the existing DB.deleteUser method that already handles contributions
        await DB.deleteUser(id);
        
        console.log(`User ${id} deleted successfully`);
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting user:', error);
        
        // Provide more specific error messages
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete user: User has associated data that must be removed first'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error deleting user: ' + (error.message || 'Unknown error')
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
