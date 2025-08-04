const express = require('express')
const uporabnik = express.Router()
const DB = require('../DB/dbConn')
const bcrypt = require('bcrypt')

// Preveri, če je uporabnik prijavljen

// Inserts a new user in our database
uporabnik.post('/register', async (req, res) => {
    var ime = req.body.ime;
    var priimek = req.body.priimek;
    var email = req.body.email;
    var geslo = req.body.geslo;
    var vloga = req.body.vloga;
    if (ime && priimek && email && geslo && vloga) {
        try {
            const bezbednoGeslo = await bcrypt.hash(geslo, 10);
            let queryResult = await DB.createUser(ime, priimek, email, bezbednoGeslo, vloga);
            console.log(queryResult)
            res.json({ success: true, message: `User ${ime} registered!` });
            res.status(200)
        }
        catch (err) {
            console.log(err)
            res.sendStatus(500)
        }
    }
    else {
        console.log("Please enter Username and Password!")
        res.json({ success: false, message: "Please enter Username and Password!" });
        res.status(204)
    }
    res.end();
})

// Login endpoint
uporabnik.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await DB.authUser(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.geslo);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Successful login
        res.json({ message: 'Login successful', user: { id: user.id, ime: user.ime, priimek: user.priimek, vloga: user.vloga } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
});

uporabnik.get('/', async (req, res) => {
    try {
        let queryResult = await DB.allUsers();
        res.json(queryResult);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.sendStatus(500);
    }
});

module.exports = uporabnik