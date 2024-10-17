exports.getCompany = async function getCompany(companyId) {
    const axios = require('axios');

    const company = axios.get(`https://cedtintern.cp.eng.chula.ac.th/api/internal/v1/companies/${companyId}`, {

        headers: {
            'accept': 'application/json, text/plain, */*',
            'cookie': `token=${token}`,
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
    
    Promise.all([company])
        .then((value) => {
            console.log(value);
        });
    
    return company;    
};