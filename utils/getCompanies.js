exports.getCompanies = function getCompanies(search) {
    const axios = require('axios');

    const companies = axios.get('https://cedtintern.cp.eng.chula.ac.th/api/companies', {
        params: {
            search: search || ''
        },
        headers: {
            'accept': 'application/json, text/plain, */*',
            'cookie': `token=${token}`,
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
    
    Promise.all([companies])
        .then((values) => {
            console.log(values[0].data);
        });
    
    return companies;    
};