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

dataPool.createPrispevek = (opis, je_anonimen, referenca_opis, referenca_url, uporabnik_id = null, ples_id) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO Prispevek (uporabnik_id, ples_id, opis, je_anonimen, referenca_opis, referenca_url, status, datum_ustvarjen) VALUES (?, ?, ?, ?, ?, ?, 'cakajoc', NOW())`,
      [uporabnik_id, ples_id, opis, je_anonimen, referenca_opis, referenca_url], (err, res) => {
        if (err) { return reject(err) }
        return resolve(res)
      })
  })
}

// Create or get region by name
dataPool.createOrGetRegion = (ime, koordinata_x, koordinata_y) => {
  return new Promise((resolve, reject) => {
    // First check if region exists
    conn.query(`SELECT id FROM Regija WHERE ime = ?`, [ime], (err, res) => {
      if (err) { return reject(err) }
      
      if (res.length > 0) {
        // Region exists, return its ID
        return resolve({ id: res[0].id, isNew: false })
      } else {
        // Create new region
        conn.query(`INSERT INTO Regija (ime, koordinata_x, koordinata_y) VALUES (?, ?, ?)`,
          [ime, koordinata_x, koordinata_y], (err, res) => {
            if (err) { return reject(err) }
            return resolve({ id: res.insertId, isNew: true })
          })
      }
    })
  })
}

// Create dance
dataPool.createDance = (regija_id, ime, tip_plesa, kratka_zgodovina, opis_tehnike) => {
  return new Promise((resolve, reject) => {
    if (tip_plesa === 'обредни') {
      tip_plesa = 0; // Convert to integer for database enum
    } else {
      tip_plesa = 1; // Convert to integer for database enum
    }
    conn.query(`INSERT INTO Ples (regija_id, ime, tip_plesa, kratka_zgodovina, opis_tehnike) VALUES (?, ?, ?, ?, ?)`,
      [regija_id, ime, tip_plesa, kratka_zgodovina, opis_tehnike], (err, res) => {
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

// Delete user (admin function)
dataPool.deleteUser = (userId) => {
  return new Promise((resolve, reject) => {
    // First check if user has any contributions that reference them
    conn.query(`SELECT COUNT(*) as count FROM Prispevek WHERE uporabnik_id = ?`, [userId], (err, res) => {
      if (err) { 
        console.error('Error checking user contributions:', err);
        return reject(err);
      }
      
      const contributionCount = res[0].count;
      
      if (contributionCount > 0) {
        // If user has contributions, we need to handle them first
        // Option 1: Set contributions to anonymous (set uporabnik_id to NULL)
        conn.query(`UPDATE Prispevek SET uporabnik_id = NULL WHERE uporabnik_id = ?`, [userId], (updateErr) => {
          if (updateErr) {
            console.error('Error updating user contributions:', updateErr);
            return reject(updateErr);
          }
          
          // Now delete the user
          conn.query(`DELETE FROM Uporabnik WHERE id = ?`, [userId], (deleteErr, deleteRes) => {
            if (deleteErr) { 
              console.error('Error deleting user:', deleteErr);
              return reject(deleteErr);
            }
            console.log(`User ${userId} deleted successfully, ${contributionCount} contributions made anonymous`);
            return resolve(deleteRes);
          });
        });
      } else {
        // No contributions, safe to delete user directly
        conn.query(`DELETE FROM Uporabnik WHERE id = ?`, [userId], (deleteErr, deleteRes) => {
          if (deleteErr) { 
            console.error('Error deleting user:', deleteErr);
            return reject(deleteErr);
          }
          console.log(`User ${userId} deleted successfully`);
          return resolve(deleteRes);
        });
      }
    });
  });
}

// Get pending contributions (for moderation)
dataPool.getPendingContributions = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM Prispevek WHERE status = 'cakajoc' OR status IS NULL`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// Get approved contributions (for public display)
dataPool.getApprovedContributions = () => {
  return new Promise((resolve, reject) => {
    conn.query(`
      SELECT p.*, u.ime, u.priimek, u.email 
      FROM Prispevek p 
      LEFT JOIN Uporabnik u ON p.uporabnik_id = u.id 
      WHERE p.status = 'odobren' 
      ORDER BY p.datum_ustvarjen DESC
    `, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// Approve/reject contribution
dataPool.updateContributionStatus = (contributionId, status) => {
  return new Promise((resolve, reject) => {
    conn.query(`UPDATE Prispevek SET status = ? WHERE id = ?`, 
      [status, contributionId], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.addRevision = (contributionId, userId, status, comment) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO Revizija (prispevek_id, uporabnik_id, status, komentar) VALUES (?, ?, ?, ?)`,
      [contributionId, userId, status, comment], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

module.exports = dataPool;