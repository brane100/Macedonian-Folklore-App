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
        var queryResult = await DB.onePrispevek(req.params.id)
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
        const validTipPlesa = ['обредни', 'световни'];
        if (!validTipPlesa.includes(tipPlesa)) {
            return res.status(400).json({
                success: false,
                msg: `Невалиден тип на плес. Дозволени се: обредни, световни ${tipPlesa}`
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