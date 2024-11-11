const axios = require('axios');
const { getIDPaccessToken } = require('./getIDPaccessToken');

exports.getStudentData = async function getStudentData(studentId) {
  const token = await getIDPaccessToken();
  const queryParams = {
    studentIds: studentId,
  }

  const options = {
    method: 'GET',
    url: 'https://cedtintern.cp.eng.chula.ac.th/api/internal/v1/students',
    params: queryParams,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  };
  
  const students = await axios.request(options).then(function (response) {
    return response.data
  }).catch(function (error) {
    console.error(error);
    return null
  });

  return students;
};