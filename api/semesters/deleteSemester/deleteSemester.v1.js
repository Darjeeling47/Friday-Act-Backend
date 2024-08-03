const { semester } = require("../..");

module.exports = async (req, res, next) => {
  const { id } = req.params;

  try {
    // check if the semester already exists
    const existingSemester = await knex('semesters').where({ id }).first();

    if (!existingSemester) {
      return res.status(404).json({ message: "This semester is not found." });
    }

    // delete the semester
    await knex('semesters').where({ id }).del();

    return res.status(200).json({
      success: true,
      semester: {}
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred.", error });
  }
}