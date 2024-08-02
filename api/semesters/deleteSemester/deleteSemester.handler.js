const deleteSemesterV1 = require("./deleteSemester.v1")

exports.v1 = async (req, res, next) => {
  const returnMessage = deleteSemesterV1('a message');
  res.status(200).send({"message": returnMessage})
}