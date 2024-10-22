exports.getUserInfoFromToken = async function getUserInfoFromToken(token) {
  try {
    if (!token) {
      return null;
    }

    const apiUrl = 'https://cedtintern.cp.eng.chula.ac.th/api/oauth/v1/profile';

    const response = await fetch(apiUrl, {
      headers: {
        "accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Unable to Fetch information.');
    }

    const JSONresponse = await response.json();
    return JSONresponse;

  } catch (error) {
    console.error('Error: ', error);
    return null;
  }
};
