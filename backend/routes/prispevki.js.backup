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
    console.log('=== MY-CONTRIBUTIONS ENDPOINT HIT ===');
    try {
        console.log('Session data:', JSON.stringify(req.session, null, 2));
        console.log('User ID from session:', req.session.user_id);
        
        if (!req.session.user_id) {
            console.log('❌ No user_id in session - returning 401');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        console.log('✅ User authenticated, user_id:', req.session.user_id);
        
        // Use the existing function instead of custom query
        console.log('📝 Using existing DB function...');
        try {
            const queryResult = await DB.prispevekKorisnika(req.session.user_id);
            console.log('✅ Query executed successfully');
            console.log('📊 Query result:', queryResult);
            console.log('� Number of results:', queryResult ? queryResult.length : 0);
            
            const response = {
                success: true,
                data: queryResult || []
            };
            
            console.log('� Sending response:', JSON.stringify(response, null, 2));
            res.json(response);
            console.log('✅ Response sent successfully');
            
        } catch (queryError) {
            console.error('❌ Database query failed:', queryError);
            throw queryError;
        }
        
    } catch (err) {
        console.error('❌ ERROR in my-contributions endpoint:', err);
        console.error('❌ Error stack:', err.stack);
        
        // Ensure we send a JSON response even on error
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Error fetching contributions',
                error: err.message
            });
        }
    }
    console.log('=== MY-CONTRIBUTIONS ENDPOINT END ===');
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

        const contributionId = req.params.id;

        // First verify the contribution belongs to the user and has status 3 (needs editing)
        const contribution = await DB.query(
            'SELECT * FROM Prispevek WHERE id = ? AND uporabnik_id = ? AND status = 3',
            [contributionId, req.session.user_id]
        );

        if (contribution.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contribution not found or cannot be resubmitted'
            });
        }

        // Update status back to pending (0) and clear moderator notes
        await DB.query(
            'UPDATE Prispevek SET status = 0 WHERE id = ?',
            [contributionId]
        );

        res.json({
            success: true,
            message: 'Contribution resubmitted successfully'
        });

    } catch (err) {
        console.error('Error resubmitting contribution:', err);
        res.status(500).json({
            success: false,
            message: 'Error resubmitting contribution'
        });
    }
});

// Edit contribution - only for contributions with status 2 (rejected) or 3 (needs editing)
prispevki.put('/edit/:id', async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const contributionId = req.params.id;
        const {
            // Use same parameter names as submit endpoint
            novPlesIme,          // instead of ime_na_ples
            tipPlesa,            // instead of tip_plesa
            kratkaZgodovina,     // instead of literatura
            opisTehnike,         // instead of opis
            regijaId,            // instead of regija_id
            opis,                // contribution description
            referencaOpis,       // instead of literatura
            referencaUrl         // instead of izvor
        } = req.body;

        // First verify the contribution belongs to the user and can be edited
        const contribution = await DB.query(
            'SELECT p.*, pl.regija_id FROM Prispevek p JOIN Ples pl ON p.ples_id = pl.id WHERE p.id = ? AND p.uporabnik_id = ? AND (p.status = 2 OR p.status = 3)',
            [contributionId, req.session.user_id]
        );

        if (contribution.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contribution not found or cannot be edited'
            });
        }

        const existingContribution = contribution[0];

        // Validate required fields
        if (!novPlesIme || !regijaId) {
            return res.status(400).json({
                success: false,
                message: 'Dance name and region are required'
            });
        }

        // Map region IDs to region names and coordinates (same as submit logic)
        const regionMap = {
            "1": { ime: "Пелагонија", koordinata_x: 21.4369, koordinata_y: 41.2317 },
            "2": { ime: "Скопје", koordinata_x: 21.4254, koordinata_y: 41.9981 },
            "3": { ime: "Вардарска Македонија", koordinata_x: 21.7453, koordinata_y: 41.6086 },
            "4": { ime: "Источна Македонија", koordinata_x: 22.3744, koordinata_y: 41.7151 },
            "5": { ime: "Југозападен дел", koordinata_x: 20.8934, koordinata_y: 41.2317 },
            "6": { ime: "Југоисточен дел", koordinata_x: 22.3744, koordinata_y: 41.3317 },
            "7": { ime: "Полог", koordinata_x: 20.9590, koordinata_y: 42.0650 },
            "8": { ime: "Североисточен дел", koordinata_x: 22.1953, koordinata_y: 42.1354 }
        };

        // Use provided regijaId or keep the existing one
        const targetRegijaId = regijaId || existingContribution.regija_id;
        const regionInfo = regionMap[targetRegijaId.toString()];
        
        if (!regionInfo) {
            return res.status(400).json({
                success: false,
                message: 'Invalid region'
            });
        }

        // 1. Create or get region (same as submit logic)
        const regionResult = await DB.createOrGetRegion(
            regionInfo.ime,
            regionInfo.koordinata_x,
            regionInfo.koordinata_y 
        );

        // 2. Update the Ples table using the same parameters as createDance
        await DB.updateDance(
            existingContribution.ples_id,  // ples_id
            regionResult.id,               // regija_id
            novPlesIme,                   // ime
            tipPlesa,                     // tip_plesa (will be converted in function)
            kratkaZgodovina || null,      // kratka_zgodovina
            opisTehnike || null           // opis_tehnike
        );

        // 3. Update the Prispevek table using the same parameters as createPrispevek
        await DB.updatePrispevek(
            contributionId,               // prispevek_id
            opis || null,                // opis
            referencaOpis || null,       // referenca_opis
            referencaUrl || null         // referenca_url
        );

        res.json({
            success: true,
            message: 'Contribution updated and resubmitted for moderation'
        });

    } catch (err) {
        console.error('Error editing contribution:', err);
        res.status(500).json({
            success: false,
            message: 'Error editing contribution'
        });
    }
});

// Inserts one new item to the database
prispevki.post('/', async (req, res, next) => {

    let opis = req.body.opis
    let je_anonimen = req.body.je_anonimen
    let referenca_opis = req.body.referenca_opis
    let referenca_url = req.body.referenca_url

    if (req.session.logged_in) {
        var isAcompletePrispevek = opis && je_anonimen && referenca_opis && referenca_url
        if (isAcompletePrispevek) {
            try {
                var queryResult = await DB.createPrispevek(opis, je_anonimen, referenca_opis, referenca_url)
                if (queryResult.affectedRows) {
                    console.log("Prispevek dodan!!")
                    res.status(200).json(
                        {
                            success: true,
                            msg: "Prispevek dodan!",
                        }
                    )
                }
            }
            catch (err) {
                console.log(err)
                res.sendStatus(500)
            }
        }
        else {
            console.log("Polje je prazno!!")
        }
    } else {
        console.log("Napaka, niste prijavljeni!")
        res.status(500).json(
            {
                success: false,
                msg: "Ne morem dodati prispevka. Morate se prijaviti!"
            }
        )
    }
    res.end()
})

// Submit complete contribution with dance details
prispevki.post('/submit', async (req, res, next) => {
    try {
        const {
            // Dance information
            novPlesIme,
            tipPlesa,
            kratkaZgodovina,
            opisTehnike,
            
            // Region information
            regijaId,
            
            // Contribution information
            opis,
            jeAnonimen,
            referencaOpis,
            referencaUrl
        } = req.body;

        // Map region IDs to region names and coordinates
        const regionMap = {
            "1": { ime: "Пелагонија", koordinata_x: 21.4369, koordinata_y: 41.2317 },
            "2": { ime: "Скопје", koordinata_x: 21.4254, koordinata_y: 41.9981 },
            "3": { ime: "Вардарска Македонија", koordinata_x: 21.7453, koordinata_y: 41.6086 },
            "4": { ime: "Источна Македонија", koordinata_x: 22.3744, koordinata_y: 41.7151 },
            "5": { ime: "Југозападен дел", koordinata_x: 20.8934, koordinata_y: 41.2317 },
            "6": { ime: "Југоисточен дел", koordinata_x: 22.3744, koordinata_y: 41.3317 },
            "7": { ime: "Полог", koordinata_x: 20.9590, koordinata_y: 42.0650 },
            "8": { ime: "Североисточен дел", koordinata_x: 22.1953, koordinata_y: 42.1354 }
        };

        const regionInfo = regionMap[regijaId];
        if (!regionInfo) {
            return res.status(400).json({
                success: false,
                msg: "Невалидна регија"
            });
        }

        // Validate region coordinates
        if (!regionInfo.koordinata_x || !regionInfo.koordinata_y) {
            return res.status(400).json({
                success: false,
                msg: "Невалидни координати за регијата"
            });
        }

        // Validate required fields
        if (!novPlesIme || !tipPlesa || !regijaId) {
            return res.status(400).json({
                success: false,
                msg: "Потребни се име на плес, тип на плес и регија"
            });
        }

        // Convert string to integer for database enum
        let tipPlesInt = 0; // Default to 0 for 'обредни'
        if (tipPlesa === 'световни') {
            tipPlesInt = 1;
        }

        // Validate tipPlesa enum
        const validTipPlesa = ['обредни', 'посветни'];
        if (!validTipPlesa.includes(tipPlesa)) {
            return res.status(400).json({
                success: false,
                msg: `Невалиден тип на плес. Дозволени се: обредни, посветни -:${tipPlesa}:-`
            });
        }
        console.log("^^ :"+regionInfo.ime +" " + regionInfo.koordinata_x + " " + regionInfo.koordinata_y);
        // 1. Create or get region
        const regionResult = await DB.createOrGetRegion(
            regionInfo.ime,
            regionInfo.koordinata_x,
            regionInfo.koordinata_y 
        );

        console.log("^^ :"+regionResult.id+ " " + novPlesIme + " " + tipPlesInt + " " + kratkaZgodovina + " " + opisTehnike);
        // 2. Create dance
        const danceResult = await DB.createDance(
            regionResult.id,
            novPlesIme,
            tipPlesInt,
            kratkaZgodovina || null,
            opisTehnike || null
        );

        // 3. Create contribution
        const uporabnikId = jeAnonimen ? null : (req.session.user_id || null);
        const contributionResult = await DB.createPrispevek(
            opis || null,
            jeAnonimen,
            referencaOpis || null,
            referencaUrl || null,
            uporabnikId,
            danceResult.insertId
        );

        if (contributionResult.affectedRows) {
            console.log("Kompletna priloga uspešno dodana!");
            res.status(200).json({
                success: true,
                msg: "Вашата priloga е успешно додадена и чека одобрение!",
                data: {
                    contributionId: contributionResult.insertId,
                    danceId: danceResult.insertId,
                    regionId: regionResult.id,
                    isNewRegion: regionResult.isNew
                }
            });
        } else {
            throw new Error("Грешка при додавање на priloga");
        }

    } catch (err) {
        console.error("Грешка при додавање на kompletна priloga:", err);
        res.status(500).json({
            success: false,
            msg: "Грешка при додавање на priloga. Обидете се повторно."
        });
    }
})

module.exports = prispevki