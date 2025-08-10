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
    conn.query(`
      SELECT p.*, 
             u.ime AS user_ime, u.priimek, u.email, 
             pl.ime AS ime_plesa, pl.tip_plesa, 
             pl.kratka_zgodovina, pl.opis_tehnike,
             r.ime AS regija
      FROM Prispevek p 
      LEFT JOIN Uporabnik u ON p.uporabnik_id = u.id 
      LEFT JOIN Ples pl ON p.ples_id = pl.id
      LEFT JOIN Regija r ON pl.regija_id = r.id
      WHERE p.id = ?
    `, [id], (err, res) => {
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
        if (err) {
          console.error('Database error in createPrispevek:', err);
          return reject(err)
        }
        console.log('Successfully created prispevek with ID:', res.insertId);
        return resolve(res)
      })
  })
}

// Create or get region by name
dataPool.createOrGetRegion = (ime, koordinata_x, koordinata_y) => {
  return new Promise((resolve, reject) => {
    // First check if region exists
    conn.query(`SELECT id FROM Regija WHERE ime = ?`, [ime], (err, res) => {
      if (err) {
        console.error('Database error in createOrGetRegion (SELECT):', err);
        return reject(err)
      }

      if (res.length > 0) {
        // Region exists, return its ID
        console.log('Found existing region with ID:', res[0].id);
        return resolve({ id: res[0].id, isNew: false })
      } else {
        // Create new region
        conn.query(`INSERT INTO Regija (ime, koordinata_x, koordinata_y) VALUES (?, ?, ?)`,
          [ime, koordinata_x, koordinata_y], (err, res) => {
            if (err) {
              console.error('Database error in createOrGetRegion (INSERT):', err);
              return reject(err)
            }
            console.log('Created new region with ID:', res.insertId);
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
      tip_plesa = 'obredni'; // Convert to integer for database enum
    } else if (tip_plesa === 'посветни') {
      tip_plesa = 'posvetni'; // Convert to integer for database enum
    }

    console.log('Creating dance with params:', { regija_id, ime, tip_plesa, kratka_zgodovina, opis_tehnike });

    conn.query(`INSERT INTO Ples (regija_id, ime, tip_plesa, kratka_zgodovina, opis_tehnike) VALUES (?, ?, ?, ?, ?)`,
      [regija_id, ime, tip_plesa, kratka_zgodovina, opis_tehnike], (err, res) => {
        if (err) {
          console.error('Database error in createDance:', err);
          return reject(err)
        }
        console.log('Successfully created dance with ID:', res.insertId);
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

// Add function to add favorite
dataPool.addFavorite = (user_id, prispevek_id) => {
  return new Promise((resolve, reject) => {
    conn.query(`
      INSERT IGNORE INTO Uporabnik_vsecka_Prispevek (uporabnik_id, prispevek_id) 
      VALUES (?, ?)
    `, [user_id, prispevek_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// Add function to remove favorite
dataPool.removeFavorite = (user_id, prispevek_id) => {
  return new Promise((resolve, reject) => {
    conn.query(`
      DELETE FROM Uporabnik_vsecka_Prispevek 
      WHERE uporabnik_id = ? AND prispevek_id = ?
    `, [user_id, prispevek_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// Check if user has favorited a contribution
dataPool.isFavorite = (user_id, prispevek_id) => {
  return new Promise((resolve, reject) => {
    conn.query(`
      SELECT COUNT(*) as count 
      FROM Uporabnik_vsecka_Prispevek 
      WHERE uporabnik_id = ? AND prispevek_id = ?
    `, [user_id, prispevek_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res[0].count > 0)
    })
  })
}

dataPool.checkLikeCount = (prispevek_id) => {
  return new Promise((resolve, reject) => {
    conn.query(`
      SELECT COUNT(*) as count 
      FROM Uporabnik_vsecka_Prispevek 
      WHERE prispevek_id = ?
    `, [prispevek_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res[0].count)
    })
  })
}

dataPool.getFavoriteContributions = (user_id) => {
  return new Promise((resolve, reject) => {
    conn.query(`
      SELECT p.*, 
             u.ime AS user_ime, u.priimek, u.email, 
             pl.ime AS ime_plesa, pl.tip_plesa, 
             pl.kratka_zgodovina, pl.opis_tehnike,
             r.ime AS regija
      FROM Prispevek p 
      LEFT JOIN Uporabnik u ON p.uporabnik_id = u.id 
      LEFT JOIN Ples pl ON p.ples_id = pl.id
      LEFT JOIN Regija r ON pl.regija_id = r.id
      WHERE p.status = 'odobren' AND p.id IN (
          SELECT prispevek_id FROM Uporabnik_vsecka_Prispevek WHERE uporabnik_id = ?
      )
    `, [user_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// Get user's liked post IDs only (for frontend like state)
dataPool.getUserLikedPostIds = (user_id) => {
  return new Promise((resolve, reject) => {
    conn.query(`
      SELECT prispevek_id FROM Uporabnik_vsecka_Prispevek WHERE uporabnik_id = ?
    `, [user_id], (err, res) => {
      if (err) { return reject(err) }
      // Return just the array of post IDs
      const postIds = res.map(row => row.prispevek_id);
      return resolve(postIds)
    })
  })
}

// Get pending contributions (for moderation)
dataPool.getPendingContributions = () => {
  return new Promise((resolve, reject) => {
    conn.query(`
      SELECT p.*, 
             u.ime AS user_ime, u.priimek, u.email, 
             pl.ime AS ime_plesa, pl.tip_plesa, 
             pl.kratka_zgodovina, pl.opis_tehnike,
             r.ime AS regija
      FROM Prispevek p 
      LEFT JOIN Uporabnik u ON p.uporabnik_id = u.id 
      LEFT JOIN Ples pl ON p.ples_id = pl.id
      LEFT JOIN Regija r ON pl.regija_id = r.id
      WHERE p.status = 'cakajoc'`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// Get approved contributions (for public display)
dataPool.getApprovedContributions = () => {
  return new Promise((resolve, reject) => {
    conn.query(`
      SELECT p.*, 
             u.ime AS user_ime, u.priimek, u.email, 
             pl.ime AS ime_plesa, pl.tip_plesa, 
             pl.kratka_zgodovina, pl.opis_tehnike,
             r.ime AS regija,
             COALESCE(like_counts.like_count, 0) AS like_count
      FROM Prispevek p 
      LEFT JOIN Uporabnik u ON p.uporabnik_id = u.id 
      LEFT JOIN Ples pl ON p.ples_id = pl.id
      LEFT JOIN Regija r ON pl.regija_id = r.id
      LEFT JOIN (
        SELECT prispevek_id, COUNT(*) as like_count
        FROM Uporabnik_vsecka_Prispevek 
        GROUP BY prispevek_id
      ) like_counts ON p.id = like_counts.prispevek_id
      WHERE p.status = 'odobren'
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

// Update dance
dataPool.updateDance = (ples_id, regija_id, ime, tip_plesa, kratka_zgodovina, opis_tehnike) => {
  return new Promise((resolve, reject) => {
    if (tip_plesa === 'обредни') {
      tip_plesa = 0; // Convert to integer for database enum
    } else if (tip_plesa === 'посветни') {
      tip_plesa = 1; // Convert to integer for database enum
    }
    conn.query(`UPDATE Ples SET regija_id = ?, ime = ?, tip_plesa = ?, kratka_zgodovina = ?, opis_tehnike = ? WHERE id = ?`,
      [regija_id, ime, tip_plesa, kratka_zgodovina, opis_tehnike, ples_id], (err, res) => {
        if (err) { return reject(err) }
        return resolve(res)
      })
  })
}

// Update prispevek
dataPool.updatePrispevek = (prispevek_id, opis, referenca_opis, referenca_url) => {
  return new Promise((resolve, reject) => {
    conn.query(`UPDATE Prispevek SET opis = ?, referenca_opis = ?, referenca_url = ? WHERE id = ?`,
      [opis, referenca_opis, referenca_url, prispevek_id], (err, res) => {
        if (err) { return reject(err) }
        return resolve(res)
      })
  })
}

// Generic query function
dataPool.query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    console.log('🔍 Executing query:', sql);
    console.log('🔍 With params:', params);

    conn.query(sql, params, (err, res) => {
      if (err) {
        console.error('❌ Query failed:', err);
        return reject(err)
      }
      console.log('✅ Query successful, rows returned:', res ? res.length : 0);
      return resolve(res)
    })
  })
}

module.exports = dataPool;