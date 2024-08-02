const createSemesterV1 = require("./createSemester.v1")

exports.v1 = async (req, res, next) => {
  const returnMessage = createSemesterV1('a message');
  res.status(200).send({"message": returnMessage})
}