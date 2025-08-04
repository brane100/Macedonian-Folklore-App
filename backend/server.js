require('dotenv').config();

const express = require('express');
const posts = require('./routes/prispevki'); // Importing the posts route
const uporabnik = require('./routes/uporabnik'); // Importing the uporabnik route
const moderacija = require('./routes/moderacija'); // Importing the moderation route
const cors = require('cors');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');


const DB = require('./DB/dbConn.js'); // Importing the database connection
// console.log('Ovdje load');

// console.log('DB_USER:', process.env.DB_USER);
// console.log('Ovdje load');
const app = express();
const PORT = process.env.PORT || 4445;

const users = [{name: 'stanko'}]

// Middleware - CORS configuration for authentication
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Frontend URLs
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
app.use('/posts', posts); // Use the posts route
app.use('/uporabnik', uporabnik); // Use the uporabnik route
app.use('/moderacija', moderacija); // Use the moderation route

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

// Folklore routes (example)
app.get('/api/folklore', (req, res) => {
  res.json({
    message: 'Folklore data endpoint',
    data: [
      {
        id: 1,
        title: 'Macedonian Folk Tales',
        description: 'Traditional stories from Macedonia',
        region: 'Pelagonija'
      },
      {
        id: 2,
        title: 'Traditional Dances',
        description: 'Folk dances from different regions',
        region: 'Skopje'
      }
    ]
  });
});

// User authentication routes (example)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // This is just a placeholder - implement real authentication
  if (username && password) {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'dummy-jwt-token'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Username and password required'
    });
  }
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
