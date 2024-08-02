const updateSemesterV1 = require('./updateSemester.v1');

exports.v1 = async (req, res, next) => {
  const returnMessage = updateSemesterV1('a message');
  res.status(200).send({"message": returnMessage})
}