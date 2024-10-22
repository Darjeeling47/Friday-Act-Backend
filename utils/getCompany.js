const axios = require('axios');

exports.getCompany = async function getCompany(companyId, token) {
    const options = {
        method: 'GET',
        url: 'https://cedtintern.cp.eng.chula.ac.th/api/internal/v1/companies/' + companyId,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
    };
      
    const company = axios.request(options).then(function (response) {
    console.log(response.data);
    }).catch(function (error) {
    console.error(error);
    });
  
    return company;
};