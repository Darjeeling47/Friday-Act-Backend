const axios = require('axios');

exports.getStudentData = function getStudentData(token, studentId) {
  const options = {
    method: 'GET',
    url: 'https://cedtintern.cp.eng.chula.ac.th/api/internal/v1/students',
    params: {
      studentIds: studentId
    },
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  };
  
  const students = axios.request(options).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.error(error);
  });

  return students;
};
