const express = require('express')
const posts = express.Router()

posts.get('/', (req, res) => {
    console.log('The route has been reached')
    res.send("posts")
})

module.exports = posts