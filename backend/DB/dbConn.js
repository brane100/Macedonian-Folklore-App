const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
})

conn.connect((err) => {
  if (err) {
    console.log("ERROR: " + err.message);
    return;
  }
  console.log('Connection established');
})

let dataPool = {}

dataPool.allPrispevki = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM Prispevek`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.enPrispevek = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM Prispevek WHERE id = ?`, id, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res[0])
    })
  })
}

dataPool.prispevekKorisnika = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM Prispevek WHERE uporabnik_id = ?`, id, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.prispevekPlesa = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM Prispevek WHERE ples_id = ?`, id, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.createPrispevek = (opis, je_anonimen, referenca_opis, referenca_url) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO Prispevek (opis, je_anonimen, referenca_opis, referenca_url) VALUES (?, ?, ?, ?)`,
      [opis, je_anonimen, referenca_opis, referenca_url], (err, res) => {
        if (err) { return reject(err) }
        return resolve(res)
      })
  })
}

dataPool.createUser = (ime, priimek, email, geslo, vloga) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO ${process.env.DB_DATABASE}.Uporabnik (ime, priimek, email, geslo, vloga) VALUES (?,?,?,?,?)`, [ime, priimek, email, geslo, vloga], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.AuthUser = (email) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM Uporabnik WHERE email = ?`, email, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res[0])
    })
  })
}

module.exports = dataPool;