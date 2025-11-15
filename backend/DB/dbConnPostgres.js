const { Pool } = require('pg');

// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_HOST:', process.env.DB_HOST);
// console.log('DB_DATABASE:', process.env.DB_DATABASE); 
// console.log('DB_PASS:', process.env.DB_PASS);

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 5432,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

console.log('PostgreSQL connection pool initialized');

let dataPool = {}

dataPool.allPrispevki = () => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM Prispevek`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res.rows)
    })
  })
}

dataPool.enPrispevek = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT p.*, 
             u.ime AS user_ime, u.priimek, u.email, 
             pl.ime AS ime_plesa, pl.tip_plesa, 
             pl.kratka_zgodovina, pl.opis_tehnike,
             r.ime AS regija
      FROM Prispevek p 
      LEFT JOIN Uporabnik u ON p.uporabnik_id = u.id 
      LEFT JOIN Ples pl ON p.ples_id = pl.id
      LEFT JOIN Regija r ON pl.regija_id = r.id
      WHERE p.id = $1
    `, [id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res.rows[0])
    })
  })
}

dataPool.prispevekKorisnika = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM Prispevek WHERE uporabnik_id = $1`, [id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res.rows)
    })
  })
}

dataPool.prispevekPlesa = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM Prispevek WHERE ples_id = $1`, [id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res.rows)
    })
  })
}

dataPool.createPrispevek = (opis, je_anonimen, referenca_opis, referenca_url, uporabnik_id = null, ples_id) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO Prispevek (uporabnik_id, ples_id, opis, je_anonimen, referenca_opis, referenca_url, status, datum_ustvarjen) VALUES ($1, $2, $3, $4, $5, $6, 'cakajoc', NOW()) RETURNING id`,
      [uporabnik_id, ples_id, opis, je_anonimen, referenca_opis, referenca_url], (err, res) => {
        if (err) {
          console.error('Database error in createPrispevek:', err);
          return reject(err)
        }
        console.log('Successfully created prispevek with ID:', res.rows[0].id);
        return resolve(res.rows[0])
      })
  })
}

// Create or get region by name
dataPool.createOrGetRegion = (ime, koordinata_x, koordinata_y) => {
  return new Promise((resolve, reject) => {
    // First check if region exists
    pool.query(`SELECT id FROM Regija WHERE ime = $1`, [ime], (err, res) => {
      if (err) {
        console.error('Database error in createOrGetRegion (SELECT):', err);
        return reject(err)
      }

      if (res.rows.length > 0) {
        // Region exists, return its ID
        console.log('Found existing region with ID:', res.rows[0].id);
        return resolve({ id: res.rows[0].id, isNew: false })
      } else {
        // Create new region
        pool.query(`INSERT INTO Regija (ime, koordinata_x, koordinata_y) VALUES ($1, $2, $3) RETURNING id`,
          [ime, koordinata_x, koordinata_y], (err, res) => {
            if (err) {
              console.error('Database error in createOrGetRegion (INSERT):', err);
              return reject(err)
            }
            console.log('Created new region with ID:', res.rows[0].id);
            return resolve({ id: res.rows[0].id, isNew: true })
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

    pool.query(`INSERT INTO Ples (regija_id, ime, tip_plesa, kratka_zgodovinas, opis_tehnike) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [regija_id, ime, tip_plesa, kratka_zgodovina, opis_tehnike], (err, res) => {
        if (err) {
          console.error('Database error in createDance:', err);
          return reject(err)
        }
        console.log('Successfully created dance with ID:', res.rows[0].id);
        return resolve(res.rows[0])
      })
  })
}

dataPool.createUser = (ime, priimek, email, geslo, vloga) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO Uporabnik (ime, priimek, email, geslo, vloga) VALUES ($1, $2, $3, $4, $5) RETURNING id`, [ime, priimek, email, geslo, vloga], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res.rows[0])
    })
  })
}

dataPool.authUser = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM Uporabnik WHERE email = $1`, [email], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res.rows[0])
    })
  })
}

dataPool.allUsers = () => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM Uporabnik`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res.rows)
    })
  })
}

// Get user by ID with role
dataPool.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT id, ime, priimek, email, vloga FROM Uporabnik WHERE id = $1`, [id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res.rows[0])
    })
  })
}

// Update user role (admin function)
dataPool.updateUserRole = (userId, newRole) => {
  return new Promise((resolve, reject) => {
    pool.query(`UPDATE Uporabnik SET vloga = $1 WHERE id = $2`, [newRole, userId], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// Delete user (admin function)
dataPool.deleteUser = (userId) => {
  return new Promise((resolve, reject) => {
    // First check if user has any contributions that reference them
    pool.query(`SELECT COUNT(*) as count FROM Prispevek WHERE uporabnik_id = $1`, [userId], (err, res) => {
      if (err) {
        console.error('Error checking user contributions:', err);
        return reject(err);
      }

      const contributionCount = res.rows[0].count;

      if (contributionCount > 0) {
        // If user has contributions, we need to handle them first
        // Option 1: Set contributions to anonymous (set uporabnik_id to NULL)
        pool.query(`UPDATE Prispevek SET uporabnik_id = NULL WHERE uporabnik_id = $1`, [userId], (updateErr) => {
          if (updateErr) {
            console.error('Error updating user contributions:', updateErr);
            return reject(updateErr);
          }

          // Now delete the user
          pool.query(`DELETE FROM Uporabnik WHERE id = $1`, [userId], (deleteErr, deleteRes) => {
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
        pool.query(`DELETE FROM Uporabnik WHERE id = $1`, [userId], (deleteErr, deleteRes) => {
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
    pool.query(`
      INSERT INTO Uporabnik_vsecka_Prispevek (uporabnik_id, prispevek_id) 
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [user_id, prispevek_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// Add function to remove favorite
dataPool.removeFavorite = (user_id, prispevek_id) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      DELETE FROM Uporabnik_vsecka_Prispevek 
      WHERE uporabnik_id = $1 AND prispevek_id = $2
    `, [user_id, prispevek_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// Check if user has favorited a contribution
dataPool.isFavorite = (user_id, prispevek_id) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT COUNT(*) as count 
      FROM Uporabnik_vsecka_Prispevek 
      WHERE uporabnik_id = $1 AND prispevek_id = $2
    `, [user_id, prispevek_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(parseInt(res.rows[0].count) > 0)
    })
  })
}

dataPool.checkLikeCount = (prispevek_id) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT COUNT(*) as count 
      FROM Uporabnik_vsecka_Prispevek 
      WHERE prispevek_id = $1
    `, [prispevek_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(parseInt(res.rows[0].count))
    })
  })
}

dataPool.getFavoriteContributions = (user_id) => {
  return new Promise((resolve, reject) => {
    pool.query(`
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
          SELECT prispevek_id FROM Uporabnik_vsecka_Prispevek WHERE uporabnik_id = $1
      )
    `, [user_id], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res.rows)
    })
  })
}

// Get user's liked post IDs only (for frontend like state)
dataPool.getUserLikedPostIds = (user_id) => {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT prispevek_id FROM Uporabnik_vsecka_Prispevek WHERE uporabnik_id = $1
    `, [user_id], (err, res) => {
      if (err) { return reject(err) }
      // Return just the array of post IDs
      const postIds = res.rows.map(row => row.prispevek_id);
      return resolve(postIds)
    })
  })
}

// Get pending contributions (for moderation)
dataPool.getPendingContributions = () => {
  return new Promise((resolve, reject) => {
    pool.query(`
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
      return resolve(res.rows)
    })
  })
}

// Get approved contributions (for public display)
dataPool.getApprovedContributions = () => {
  return new Promise((resolve, reject) => {
    pool.query(`
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
      return resolve(res.rows)
    })
  })
}

// Approve/reject contribution
dataPool.updateContributionStatus = (contributionId, status) => {
  return new Promise((resolve, reject) => {
    pool.query(`UPDATE Prispevek SET status = $1 WHERE id = $2`,
      [status, contributionId], (err, res) => {
        if (err) { return reject(err) }
        return resolve(res)
      })
  })
}

dataPool.addRevision = (contributionId, userId, status, comment) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO Revizija (prispevek_id, uporabnik_id, status, komentar) VALUES ($1, $2, $3, $4)`,
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
      tip_plesa = 'obredni'; // Convert to string enum for PostgreSQL
    } else if (tip_plesa === 'посветни') {
      tip_plesa = 'posvetni'; // Convert to string enum for PostgreSQL
    }
    pool.query(`UPDATE Ples SET regija_id = $1, ime = $2, tip_plesa = $3, kratka_zgodovina = $4, opis_tehnike = $5 WHERE id = $6`,
      [regija_id, ime, tip_plesa, kratka_zgodovina, opis_tehnike, ples_id], (err, res) => {
        if (err) { return reject(err) }
        return resolve(res)
      })
  })
}

// Update prispevek
dataPool.updatePrispevek = (prispevek_id, opis, referenca_opis, referenca_url) => {
  return new Promise((resolve, reject) => {
    pool.query(`UPDATE Prispevek SET opis = $1, referenca_opis = $2, referenca_url = $3 WHERE id = $4`,
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

    pool.query(sql, params, (err, res) => {
      if (err) {
        console.error('❌ Query failed:', err);
        return reject(err)
      }
      console.log('✅ Query successful, rows returned:', res.rows ? res.rows.length : 0);
      return resolve(res.rows)
    })
  })
}

dataPool.saveMediaUrl = (url, tip, prispevekId) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO Multimedija (prispevek_id, tip, url) VALUES ($1, $2, $3)`,
      [prispevekId, tip, url], (err, res) => {
        if (err) { return reject(err) }
        return resolve(res)
      })
  })
}

dataPool.getMediaUrls = (prispevekId) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM Multimedija WHERE prispevek_id = $1`, [prispevekId], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res.rows)
    })
  })
}

module.exports = dataPool;