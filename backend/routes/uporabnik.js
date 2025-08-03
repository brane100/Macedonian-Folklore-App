const express = require('express')
const uporabnik = express.Router()
const DB = require('../db/dbConn')

// Preveri, če je uporabnik prijavljen