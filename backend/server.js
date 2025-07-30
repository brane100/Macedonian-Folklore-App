const express = require('express');
const posts = require('./routes/posts'); // Importing the posts route
const cors = require('cors');``
require('dotenv').config();
const DB = require('./DB/dbConn'); // Importing the database connection

const app = express();
const PORT = process.env.PORT || 4445;

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

app.listen(PORT, () => {
  console.log(`🏛️ Macedonian Folklore API server running on port ${PORT}`);
});

module.exports = app;
