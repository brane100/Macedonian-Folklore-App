const express = require('express')
const DB = require('../DB/dbConn')
const vsecki = express.Router()

vsecki.get('/', async (req, res) => {
    try {
        // Fetch user's favorite posts from the database
        const userId = req.session.user_id; // Assuming user ID is stored in session
        const favoritesList = await DB.getFavoriteContributions(userId);
        
        res.json({
            success: true,
            data: favoritesList
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching favorites'
        });
    }
})

vsecki.post('/:id', async (req, res) => {
    try {
        const userId = req.session.user_id;
        const contributionId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Add the contribution to the user's favorites
        await DB.addFavorite(userId, contributionId);

        res.json({
            success: true,
            message: 'Contribution added to favorites'
        });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to favorites'
        });
    }
})

module.exports = vsecki;