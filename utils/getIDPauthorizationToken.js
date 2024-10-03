exports.getIDPauthorizationToken = function getIDPauthorizationToken() {
  try {
    const bodyData = {
      grant_type: "client_credentials",
      client_id: "cedt-friday-activity",
      client_secret: process.env.CLIENT_SECRET_IDP,
    };

    fetch("https://cedtintern.cp.eng.chula.ac.th/api/oauth/token", {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Unable to Fetch information.')
      }
      return response.json().access_token;
    });
  } catch (error) {
    console.error('Error: ', error);
    return null;
  }
};
