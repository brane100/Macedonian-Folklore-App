const express = require('express')
const uporabnik = express.Router()
const DB = require('../DB/dbConn')

// Preveri, če je uporabnik prijavljen