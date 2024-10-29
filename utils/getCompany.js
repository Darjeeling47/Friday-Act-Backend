const axios = require('axios');
const { getIDPaccessToken } = require('./getIDPaccessToken');

exports.getCompany = async function getCompany(companyId) {
    const token = await getIDPaccessToken();

    const options = {
        method: 'GET',
        url: 'https://cedtintern.cp.eng.chula.ac.th/api/internal/v1/companies/' + companyId,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
    };
      
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
};