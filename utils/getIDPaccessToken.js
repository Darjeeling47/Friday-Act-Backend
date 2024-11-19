// import env from '.env'
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// Promisify SQLite operations
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      resolve(this);
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
}

exports.getIDPaccessToken = async function getIDPaccessToken() {
  try {
    const getTokenOffset = -300000; // 5 minutes buffer
    const now = new Date(Date.now() + Number(process.env.TIME_OFFSET_MS));

    // Initialize table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS TOKEN (
        service_name TEXT PRIMARY KEY, 
        token_value TEXT, 
        insert_time_unix INTEGER, 
        life_time_unix INTEGER
      )
    `);

    // Get existing token
    const localToken = await getQuery(
      "SELECT * FROM TOKEN WHERE service_name = ?", 
      ["cedt_idp"]
    );

    // Check if we need a new token
    if (!localToken || 
        !localToken.insert_time_unix || 
        now.getTime() > (localToken.insert_time_unix + localToken.life_time_unix + getTokenOffset)) {
      
      // Fetch new token
      const newToken = await tokenFetcher();
      if (newToken) {
        // Store new token
        await runQuery(`
          INSERT OR REPLACE INTO TOKEN 
          (service_name, token_value, insert_time_unix, life_time_unix) 
          VALUES (?, ?, ?, ?)`,
          [
            "cedt_idp",
            newToken,
            now.getTime(),
            86400000 // 24 hour in milliseconds
          ]
        );
        console.log(`updated cedt_idp token at ${now}`);
        return newToken;
      }
      console.log(`failed to fetch ${localToken.service_name} token at ${now}`);
      return null;
    }

    return localToken.token_value;

  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

async function tokenFetcher() {
  try {
    const bodyData = {
      grant_type: "client_credentials",
      client_id: "cedt-friday-activity", 
      client_secret: process.env.IDP_CLIENT_SECRET,
      scope: "internal",
    };

    const response = await fetch("https://cedtintern.cp.eng.chula.ac.th/api/oauth/token", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error("Unable to fetch information.");
    
    return data.access_token;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
