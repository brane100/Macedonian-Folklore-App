const mysql = require('mysql2');

// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_HOST:', process.env.DB_HOST);
// console.log('DB_DATABASE:', process.env.DB_DATABASE); 
// console.log('DB_PASS:', process.env.DB_PASS);

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
})

conn.connect((err) => {
  if (err) {
    console.log("ERROR: " + err.message);
    // console.log('DB_USER:', process.env.DB_USER);
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

dataPool.authUser = (email) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM Uporabnik WHERE email = ?`, email, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res[0])
    })
  })
}

dataPool.allUsers = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM Uporabnik`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// Get user by ID with role
dataPool.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT id, ime, priimek, email, vloga FROM Uporabnik WHERE id = ?`, id, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res[0])
    })
  })
}

// Update user role (admin function)
dataPool.updateUserRole = (userId, newRole) => {
  return new Promise((resolve, reject) => {
    conn.query(`UPDATE Uporabnik SET vloga = ? WHERE id = ?`, [newRole, userId], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// Get pending contributions (for moderation)
dataPool.getPendingContributions = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM Prispevek WHERE status = 'pending' OR status IS NULL`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// Approve/reject contribution
dataPool.updateContributionStatus = (contributionId, status, moderatorNotes = null) => {
  return new Promise((resolve, reject) => {
    conn.query(`UPDATE Prispevek SET status = ?, moderator_notes = ?, moderated_at = NOW() WHERE id = ?`, 
      [status, moderatorNotes, contributionId], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

module.exports = dataPool;