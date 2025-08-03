const express = require('express')
const prispevki = express.Router()
const DB = require('../DB/dbConn')

//Gets all the news in the DB
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

module.exports = prispevki