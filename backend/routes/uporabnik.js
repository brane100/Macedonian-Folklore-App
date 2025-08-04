const express = require('express')
const uporabnik = express.Router()
const DB = require('../DB/dbConn')
const bcrypt = require('bcrypt')

// Authentication middleware functions
function checkAuthenticated(req, res, next) {
    if (req.session && req.session.logged_in) {
        return next();
    }
    return res.status(401).json({ message: 'Authentication required', redirectTo: '/login' });
}

function checkNotAuthenticated(req, res, next) {
    if (req.session && req.session.logged_in) {
        return res.status(403).json({ message: 'Already authenticated', redirectTo: '/' });
    }
    next();
}

// Get all users
uporabnik.get('/', async (req, res) => {
    try {
        let queryResult = await DB.allUsers();
        res.json(queryResult);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.sendStatus(500);
    }
});

// Inserts a new user in our database
uporabnik.post('/register', checkNotAuthenticated, async (req, res) => {
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
uporabnik.post('/login', checkNotAuthenticated, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(204).json({ message: 'Email and password are required.' });
    }

    try {
        const queryResult = await DB.authUser(email);
        if (queryResult.length > 0) {

            const isPasswordValid = await bcrypt.compare(password, queryResult.geslo);
            if (!isPasswordValid) {
                return res.status(200).json({ success: false, message: 'Invalid email or password.' });
            }

            // Successful login
            req.session.logged_in = true;
            //////////////////////////////////////////////////////////
            req.session.email = email;
            //////////////////////////////////////////////////////////
            req.session.user_email = queryResult[0].user_email;
            //////////////////////////////////////////////////////////
            res.status(200).json({
                message: 'Login successful',
                user: {
                    id: queryResult.id,
                    ime: queryResult.ime,
                    priimek: queryResult.priimek,
                    vloga: queryResult.vloga
                }
            });
        } else {
            console.log("USER NOT REGISTRED");
            res.json({ success: false, message: "USER NOT REGISTRED" });
            res.status(200)
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(404).json({ message: 'An error occurred during login.' });
    }
});

uporabnik.get('/session', async (req, res, next) => {
    try {
        console.log("session data: ")
        console.log(req.session)
        res.json(req.session);
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
        next()
    }
})

// Check if user is authenticated (for frontend routing)
uporabnik.get('/check-auth', (req, res) => {
    res.json({
        isAuthenticated: !!(req.session && req.session.logged_in),
        user: req.session && req.session.logged_in ? {
            email: req.session.email,
            user_email: req.session.user_email
        } : null
    });
});

// logout user - destroy session
uporabnik.get('/logout', async (req, res, next) => {
    try {
        req.session.destroy(function (err) {
            res.json({ status: { success: true, msg: err } })
        })

    }
    catch (err) {
        console.log(err)
        res.json({ status: { success: false, msg: err } })
        res.sendStatus(500)
        next()
    }
})

module.exports = uporabnik