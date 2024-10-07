exports.getStudentData = function getStudentData(token, studentId) {
  try {
    if (!studentId || studentId === undefined) {
      return null
    }

    const apiUrl = 'https://cedtintern.cp.eng.chula.ac.th/api/internal/v1/students'

    const queryParams = {
      studentIds: [studentId, ''],
      limit: 1
    }

    const queryString = new URLSearchParams(queryParams).toString();

    const fullUrl = `${apiUrl}?${queryString}`;

    fetch(fullUrl, {
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Unable to Fetch information.')
      }
      const JSONresponse = response.json();

      if (JSONresponse.meta.totalItem !== 1) {
        throw new Error ('More than 1 student with this Id exists.')
      }
      
      return JSONresponse.items[0];
    });
  } catch (error) {
    console.error('Error: ', error);
    return null;
  }
};
