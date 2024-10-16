exports.getCompanies = function getCompanies() {
    const axios = require('axios');

    axios.get('https://cedtintern.cp.eng.chula.ac.th/api/companies', {
        headers: {
            'accept': 'application/json, text/plain, */*',
            'cookie': 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInBsYXRmb3JtVWlkIjoiNEZvQnRFOVJkc1hsSHVUMmpuMVhRMHNSNGlJcjE1ZEFRc1ZHNmQ2cCIsInN0dWRlbnRJZCI6IjY2MzMwODU2MjEiLCJpYXQiOjE3MjkwNjk0MjYsImV4cCI6MTcyOTE1NTgyNiwiaXNzIjoiQ0VEVCBJbnRlcm4gUG9ydGFsIEFQSSJ9.3AIyh3yIOAU7C_QD-TKQgbbedoXMheJnjyyaZRTNrn4',
        }
    })
    .then(response => {
        console.log('Data:', response.data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
};