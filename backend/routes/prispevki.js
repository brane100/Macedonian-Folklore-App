const express = require('express')
const DB = require('../DB/dbConn')
const prispevki = express.Router()

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

// Test endpoint
prispevki.get('/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ message: 'Test successful', timestamp: new Date() });
});

// Session test endpoint
prispevki.get('/test-session', (req, res) => {
    console.log('Session test endpoint hit');
    console.log('Session data:', req.session);
    res.json({ 
        message: 'Session test', 
        sessionExists: !!req.session,
        sessionData: req.session || {},
        timestamp: new Date() 
    });
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
        
        // Get detailed user contributions with related data
        console.log('Getting user contributions with details...');
        const contributionsQuery = `
            SELECT 
                p.id,
                p.opis,
                p.je_anonimen,
                p.referenca_opis,
                p.referenca_url,
                p.status,
                p.datum_ustvarjen,
                p.uporabnik_id,
                p.ples_id,
                pl.ime as ples_ime,
                pl.tip_plesa,
                pl.kratka_zgodovina,
                pl.opis_tehnike,
                r.ime as regija_ime,
                r.koordinata_x,
                r.koordinata_y,
                u.ime as uporabnik_ime,
                u.priimek as uporabnik_priimek
            FROM Prispevek p
            LEFT JOIN Ples pl ON p.ples_id = pl.id
            LEFT JOIN Regija r ON pl.regija_id = r.id
            LEFT JOIN Uporabnik u ON p.uporabnik_id = u.id
            WHERE p.uporabnik_id = ?
            ORDER BY p.datum_ustvarjen DESC
        `;
        
        const queryResult = await DB.query(contributionsQuery, [req.session.user_id]);
        console.log('Query executed successfully');
        console.log('Query result:', queryResult);
        console.log('Number of results:', queryResult ? queryResult.length : 0);
        
        // Transform the data to include nested objects for better frontend handling
        const transformedData = queryResult.map(row => ({
            id: row.id,
            opis: row.opis,
            je_anonimen: row.je_anonimen,
            referenca_opis: row.referenca_opis,
            referenca_url: row.referenca_url,
            status: row.status,
            datum_ustvarjen: row.datum_ustvarjen,
            uporabnik_id: row.uporabnik_id,
            ples_id: row.ples_id,
            ples: {
                id: row.ples_id,
                ime: row.ples_ime,
                tip_plesa: row.tip_plesa,
                kratka_zgodovina: row.kratka_zgodovina,
                opis_tehnike: row.opis_tehnike
            },
            regija: {
                ime: row.regija_ime,
                koordinata_x: row.koordinata_x,
                koordinata_y: row.koordinata_y
            },
            uporabnik: {
                ime: row.uporabnik_ime,
                priimek: row.uporabnik_priimek
            }
        }));
        
        const response = {
            success: true,
            data: transformedData || []
        };
        
        console.log('Sending response with', transformedData.length, 'contributions');
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

//Gets one new based on the id - THIS MUST BE LAST among GET routes
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

prispevki.post('/submit', async (req, res, next) => {
    try {
        console.log('=== SUBMIT ENDPOINT DEBUG ===');
        console.log('Full session object:', req.session);
        console.log('Session ID:', req.sessionID);
        console.log('Session exists?', !!req.session);
        console.log('user_id in session:', req.session?.user_id);
        console.log('logged_in in session:', req.session?.logged_in);
        console.log('Session keys:', req.session ? Object.keys(req.session) : 'no session');
        
        // Check authentication first
        if (!req.session || !req.session.user_id) {
            console.log('AUTHENTICATION FAILED:');
            console.log('- Session exists:', !!req.session);
            console.log('- user_id exists:', !!req.session?.user_id);
            console.log('- user_id value:', req.session?.user_id);
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const { regija, ples, prispevek } = req.body;
        
        console.log('Received data:', { regija, ples, prispevek });
        console.log('User ID from session:', req.session.user_id);
        
        // Validate required fields
        if (!regija || !ples || !prispevek) {
            return res.status(400).json({
                success: false,
                message: 'Missing required data: regija, ples, or prispevek'
            });
        }
        
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

        // If contribution is anonymous, set user_id to null
        const user_id = prispevek.je_anonimen ? null : req.session.user_id;
        
        // Create contribution
        const contributionResult = await DB.createPrispevek(
            prispevek.opis,
            prispevek.je_anonimen,
            prispevek.referenca_opis,
            prispevek.referenca_url,
            user_id,
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
