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
        
    const company = axios.request(options).then(function (response) {
        console.log(response.data);
        }).catch(function (error) {
        console.error(error);
        });
    
    return company;
};