const knex = require('knex')(require('../../../knexfile').development);

module.exports = async (req, res, next) => {
  const id = req.params.semesterId;

  try {
    // check if the semester already exists
    const existingSemester = await knex('SEMESTERS').where({ id }).first();

    if (!existingSemester) {
      return res.status(404).json({ message: "This semester is not found." });
    }

    // delete the semester
    await knex('SEMESTERS').where({ id }).del();

    return res.status(200).json({
      success: true,
      semester: {}
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred.", error: error.message });
  }
}