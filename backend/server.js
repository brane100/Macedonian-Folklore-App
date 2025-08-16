/////////////////////////////////////////////////////////////
require('dotenv').config();
/////////////////////////////////////////////////////////////

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const posts = require('./routes/prispevki'); // Importing the posts route
const uporabnik = require('./routes/uporabnik'); // Importing the uporabnik route
const moderacija = require('./routes/moderacija'); // Importing the moderation route
const vsecki = require('./routes/vsecki.js'); // Importing the favorites route

const DB = require('./DB/dbConn.js'); // Importing the database connection
// console.log('Ovdje load');

const path = require('path');

// console.log('DB_USER:', process.env.DB_USER);
// console.log('Ovdje load');
const app = express();
const PORT = process.env.PORT || 4445;




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//              A  L  W  A  Y  S     P  U  T     F  O  L  D  E  R     R  O  U  T  E  S     I  N     T  H  E     M  A  I  N     S  E  R  V  E  R     S  C  R  I  P  T                 //

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const multimediaFolder = path.join(__dirname, '/multimedia/');

/////////////////////////////////////////////////////////////
app.use('/files', express.static(multimediaFolder));
/////////////////////////////////////////////////////////////


// Middleware - CORS configuration for authentication
app.use(cors({
  origin: [`${process.env.FRONTEND_URL}`, `http://127.0.0.1:${PORT}`], // Frontend URLs
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
  credentials: true, // Allow cookies/sessions
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'eeeee tooo',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: false, // false for development (http), true for production (https)
    httpOnly: true, // Prevent XSS attacks
    // make it last for 30 minutes
    maxAge: 30 * 60 * 1000, // 30 minutes
    // maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Allow cross-site requests for authentication
  }
}))

// Mount routes AFTER session middleware
app.use('/prispevki', posts); // Use the posts route
app.use('/uporabnik', uporabnik); // Use the uporabnik route
app.use('/moderacija', moderacija); // Use the moderation route
app.use('/vsecki', vsecki); // Use the favorites route

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Macedonian Folklore API is running!',
    version: '1.0.0'
  });
});

// app.get('/test-env', (req, res) => {
//     res.json({
//         port: process.env.PORT,
//         dbHost: process.env.DB_HOST,
//         frontendUrl: process.env.FRONTEND_URL,
//         nodeEnv: process.env.NODE_ENV,
//         message: 'Environment variables loaded successfully!'
//     });
// });

app.post('/submit-message', (req, res) => {
  const { name, subject, message } = req.body;

  // Here you would typically save the message to the database, but now will save it locally in the messages folder
  

  console.log(`Sending message from ${name}: ${message}, with subject: ${subject}`);

  res.status(201).json({
    success: true,
    message: 'Message submitted successfully'
  });
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/users', async (req, res) => {
    // const user = {name: req.body.name, password: req.body.password};
    // users.push(user);
    // res.status(201).send(); // 201 Created
    try {
        // const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, /*salt*/ 10); 
        // 10 is the salt rounds, a good default value

        // console.log(salt)
        // console.log(hashedPassword)

        const user = {
            ime: req.body.ime,
            priimek: req.body.priimek,
            email: req.body.email,
            geslo: hashedPassword,
            vloga: 'navaden'
        }

        // users.push(user)
        await DB.createUser(user.ime, user.priimek, user.email, user.geslo, user.vloga);
        res.status(201).send()
    } catch {
        res.status(500).send()
    }
})

app.listen(PORT, () => {
  console.log(`🏛️ Macedonian Folklore API server running on port ${PORT}`);
});

module.exports = app;