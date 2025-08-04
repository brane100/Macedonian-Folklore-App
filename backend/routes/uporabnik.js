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
            console.log(queryResult);
            return res.status(201).json({ success: true, message: `User ${ime} registered successfully!` });
        }
        catch (err) {
            console.log(err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: "Email already exists. Please use a different email." });
            }
            return res.status(500).json({ success: false, message: "Registration failed. Please try again." });
        }
    }
    else {
        console.log("Missing required fields!");
        return res.status(400).json({ success: false, message: "All fields are required!" });
    }
})

// Login endpoint
uporabnik.post('/login', checkNotAuthenticated, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        const queryResult = await DB.authUser(email);
        
        // Check if user exists (authUser returns single object or undefined)
        if (queryResult && queryResult.id) {
            const isPasswordValid = await bcrypt.compare(password, queryResult.geslo);
            if (!isPasswordValid) {
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }

            // Successful login
            if (!req.session) {
                console.error('Session not available');
                return res.status(500).json({ success: false, message: 'Session configuration error' });
            }
            
            req.session.logged_in = true;
            req.session.email = email;
            req.session.user_role = queryResult.vloga; // Store user role in session
            req.session.user_id = queryResult.id; // Store user ID
            
            res.status(200).json({
                success: true,
                message: 'Login successful',
                user: {
                    id: queryResult.id,
                    ime: queryResult.ime,
                    priimek: queryResult.priimek,
                    vloga: queryResult.vloga,
                    email: email
                }
            });
        } else {
            console.log("USER NOT REGISTERED");
            return res.status(404).json({ success: false, message: "User not found. Please check your email or register first." });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'An error occurred during login.' });
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
            vloga: req.session.user_role,
            id: req.session.user_id
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

uporabnik.delete('/:id', checkAuthenticated, async (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    try {
        const queryResult = await DB.deleteUser(userId);
        if (queryResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: `User with ID ${userId} deleted successfully.` });
        } else {
            return res.status(404).json({ success: false, message: `User with ID ${userId} not found.` });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the user.' });
    }
})

module.exports = uporabnik