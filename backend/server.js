const express = require('express');
const posts = require('./routes/prispevki'); // Importing the posts route
const cors = require('cors');
require('dotenv').config();
const DB = require('./db/dbConn.js'); // Importing the database connection

const app = express();
const PORT = process.env.PORT || 4445;

const users = [{name: 'stanko'}]

// Middleware
app.use(cors());
app.use(express.json());
app.use('/posts', posts); // Use the posts route

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
