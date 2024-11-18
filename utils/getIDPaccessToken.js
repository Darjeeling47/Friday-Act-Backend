// import env from '.env'
require('dotenv').config();

exports.getIDPaccessToken = async function getIDPaccessToken() {
  try {
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
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Unable to fetch information.");
    }


    return data.access_token;

  } catch (error) {
    console.error('Error: ', error);
    return null;
  }
};
