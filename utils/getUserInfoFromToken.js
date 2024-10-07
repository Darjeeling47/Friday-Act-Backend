exports.getUserInfoFromToken = function getUserInfoFromToken(token) {
  try {
    if (!token || token === undefined) {
      return null
    }

    const apiUrl = 'https://cedtintern.cp.eng.chula.ac.th/api/oauth/v1/profile'

    fetch(apiUrl, {
      headers: {
        "accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Unable to Fetch information.')
      }
      const JSONresponse = response.json();
      
      return JSONresponse;
    });
  } catch (error) {
    console.error('Error: ', error);
    return null;
  }
};
