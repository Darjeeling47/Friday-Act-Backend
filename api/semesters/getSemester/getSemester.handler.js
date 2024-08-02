const getSemesterV1 = require('./getSemester.v1');

exports.v1 = async (req, res, next) => {
  const returnMessage = getSemesterV1('a message');
  res.status(200).send({"message": returnMessage})
}