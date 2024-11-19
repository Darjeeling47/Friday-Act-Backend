// import env from '.env'
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');


exports.getIDPaccessToken = async function getIDPaccessToken() {
  try {
    // Reading plain text token
    const tokenData = JSON.parse(fs.readFileSync('token.json', { encoding: 'utf8' }));
    const token = tokenData.access_token

    // Check if token is expired
    if (!(tokenData.currentTimestamp + tokenData.expires_in - 6000 < Math.floor(Date.now() / 1000))) {

      return token;
    }
    

    const bodyData = {
      grant_type: "client_credentials",
      client_id: "cedt-friday-activity",
      client_secret: process.env.IDP_CLIENT_SECRET,
      scope: "internal",
    };

    const response = await fetch("https://cedtintern.cp.eng.chula.ac.th/api/oauth/token", {
      method: "POST",  // POST method
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });
    let data = await response.json();

    if (!response.ok) {
      throw new Error("Unable to fetch information.");
    }

    const saveToken = (token) => {
      const tokenString = JSON.stringify(token, null, 2); // Serialize the JSON object with indentation
      fs.writeFileSync('token.json', tokenString); // Save to a JSON file
      console.log('Token saved to token.json');
    };

    console.log('Access token:', data);

    data.currentTimestamp = Math.floor(Date.now() / 1000);

    saveToken(data);


    return data.access_token;

  } catch (error) {
    console.error('Error: ', error);
    return null;
  }
};
