const express = require('express')
const prispevki = express.Router()
const DB = require('../DB/dbConn')

prispevki.get('/', async (req, res, next) => {
    try {
        var queryResult = await DB.allPrispevki();
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

//Gets all approved contributions for public display
prispevki.get('/odobren', async (req, res, next) => {
    try {
        var queryResult = await DB.getApprovedContributions();
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

//Gets one new based on the id
prispevki.get('/:id', async (req, res, next) => {
    try {
        var queryResult = await DB.enPrispevek(req.params.id)
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

prispevki.get('/user/:id', async (req, res, next) => {
    try {
        var queryResult = await DB.prispevekKorisnika(req.params.id)
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

// Test endpoint
prispevki.get('/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ message: 'Test successful', timestamp: new Date() });
});

// Get current user's contributions (requires authentication)
prispevki.get('/my-contributions', async (req, res) => {
    console.log('MY-CONTRIBUTIONS ENDPOINT HIT');
    
    try {
        console.log('Session data:', req.session);
        console.log('User ID from session:', req.session?.user_id);
        
        if (!req.session || !req.session.user_id) {
            console.log('No user_id in session - returning 401');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        console.log('User authenticated, user_id:', req.session.user_id);
        
        // Use the existing function
        console.log('Getting user contributions...');
        const queryResult = await DB.prispevekKorisnika(req.session.user_id);
        console.log('Query executed successfully');
        console.log('Query result:', queryResult);
        console.log('Number of results:', queryResult ? queryResult.length : 0);
        
        const response = {
            success: true,
            data: queryResult || []
        };
        
        console.log('Sending response:', response);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(response);
        
    } catch (err) {
        console.error('ERROR in my-contributions endpoint:', err);
        
        return res.status(500).json({
            success: false,
            message: 'Error fetching contributions',
            error: err.message
        });
    }
});

// Resubmit contribution for moderation (changes status from 3 back to 0)
prispevki.post('/resubmit/:id', async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if contribution belongs to user
        const contribution = await DB.enPrispevek(req.params.id);
        if (!contribution || contribution.uporabnik_id !== req.session.user_id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Only allow resubmit if status is 3 (needs editing)
        if (contribution.status !== 3) {
            return res.status(400).json({
                success: false,
                message: 'Can only resubmit contributions that need editing'
            });
        }

        // Update status to 0 (pending)
        await DB.updateContributionStatus(req.params.id, 0);

        res.json({
            success: true,
            message: 'Contribution resubmitted successfully'
        });

    } catch (err) {
        console.error('Error resubmitting contribution:', err);
        res.status(500).json({
            success: false,
            message: 'Error resubmitting contribution',
            error: err.message
        });
    }
});

prispevki.post('/', async (req, res, next) => {
    try {
        const { regija, ples, prispevek } = req.body;
        
        console.log('Received data:', { regija, ples, prispevek });
        
        // Create or get region
        const regionResult = await DB.createOrGetRegion(
            regija.ime, 
            regija.koordinata_x, 
            regija.koordinata_y
        );
        console.log('Region result:', regionResult);
        
        // Create dance
        const danceResult = await DB.createDance(
            regionResult.id,
            ples.ime,
            ples.tip_plesa,
            ples.kratka_zgodovina,
            ples.opis_tehnike
        );
        console.log('Dance result:', danceResult);
        
        // Create contribution
        const contributionResult = await DB.createPrispevek(
            prispevek.opis,
            prispevek.je_anonimen,
            prispevek.referenca_opis,
            prispevek.referenca_url,
            req.session.user_id,
            danceResult.insertId
        );
        console.log('Contribution result:', contributionResult);
        
        res.json({
            success: true,
            message: 'Prispevek successfully created',
            data: {
                region: regionResult,
                dance: danceResult,
                contribution: contributionResult
            }
        });
        
    } catch (err) {
        console.error('Error creating prispevek:', err);
        res.status(500).json({
            success: false,
            message: 'Error creating prispevek',
            error: err.message
        });
    }
});

// Update/edit a contribution
prispevki.put('/edit/:id', async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const contributionId = req.params.id;
        const { regija, ples, prispevek } = req.body;
        
        console.log('Editing contribution:', contributionId);
        console.log('Received data:', { regija, ples, prispevek });

        // First verify that this contribution belongs to the current user
        const existingContribution = await DB.enPrispevek(contributionId);
        if (!existingContribution || existingContribution.uporabnik_id !== req.session.user_id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied - not your contribution'
            });
        }

        // Create or get region
        const regionResult = await DB.createOrGetRegion(
            regija.ime, 
            regija.koordinata_x, 
            regija.koordinata_y
        );
        console.log('Region result:', regionResult);
        
        // Update dance - get the ples_id from existing contribution
        const danceUpdateResult = await DB.updateDance(
            existingContribution.ples_id,
            regionResult.id,
            ples.ime,
            ples.tip_plesa,
            ples.kratka_zgodovina,
            ples.opis_tehnike
        );
        console.log('Dance update result:', danceUpdateResult);
        
        // Update prispevek
        const contributionUpdateResult = await DB.updatePrispevek(
            contributionId,
            prispevek.opis,
            prispevek.referenca_opis,
            prispevek.referenca_url
        );
        console.log('Contribution update result:', contributionUpdateResult);
        
        res.json({
            success: true,
            message: 'Prispevek successfully updated',
            data: {
                region: regionResult,
                dance: danceUpdateResult,
                contribution: contributionUpdateResult
            }
        });
        
    } catch (err) {
        console.error('Error updating prispevek:', err);
        res.status(500).json({
            success: false,
            message: 'Error updating prispevek',
            error: err.message
        });
    }
});

module.exports = prispevki;
