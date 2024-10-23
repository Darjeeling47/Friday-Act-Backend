const axios = require('axios');
const { getIDPaccessToken } = require('./getIDPaccessToken');

exports.getCompanies = async function getCompanies(search) {
    const token = await getIDPaccessToken();

    const options = {
        method: 'GET',
        url: 'https://cedtintern.cp.eng.chula.ac.th/api/internal/v1/companies',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`
        },
        params: {
            search: search.search,
            limit: search.limit,
            page: search.page
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