const express = require('express')
const DB = require('../DB/dbConn')
const vsecki = express.Router()

vsecki.get('/', async (req, res) => {
    try {
        // Fetch user's favorite posts from the database
        const userId = req.session.user_id; // Assuming user ID is stored in session
        const favoritesList = await DB.getFavoriteContributions(userId);
        
        // Add like count for each post using the existing checkLikeCount query
        const favoritesWithLikeCounts = await Promise.all(
            favoritesList.map(async (post) => {
                const likeCount = await DB.checkLikeCount(post.id);
                return {
                    ...post,
                    like_count: likeCount
                };
            })
        );
        
        res.json({
            success: true,
            data: favoritesWithLikeCounts
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching favorites'
        });
    }
})

// Get user's liked post IDs only (for frontend like state)
vsecki.get('/liked-ids', async (req, res) => {
    try {
        const userId = req.session.user_id;
        
        if (!userId) {
            return res.json([]); // Return empty array if not authenticated
        }

        const likedPostIds = await DB.getUserLikedPostIds(userId);
        res.json(likedPostIds);
    } catch (error) {
        console.error('Error fetching liked post IDs:', error);
        res.status(500).json([]);
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
        
        // Get updated like count
        const likeCount = await DB.checkLikeCount(contributionId);

        res.json({
            success: true,
            message: 'Contribution added to favorites',
            likeCount: likeCount
        });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to favorites'
        });
    }
})

vsecki.delete('/:id', async (req, res) => {
    try {
        const userId = req.session.user_id;
        const contributionId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Remove the contribution from the user's favorites
        await DB.removeFavorite(userId, contributionId);
        
        // Get updated like count
        const likeCount = await DB.checkLikeCount(contributionId);

        res.json({
            success: true,
            message: 'Contribution removed from favorites',
            likeCount: likeCount
        });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from favorites'
        });
    }
})

module.exports = vsecki;