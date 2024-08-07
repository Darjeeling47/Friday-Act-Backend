const knex = require('knex')(require('../../../knexfile').development);

module.exports = async (req, res, next) => {
  const id = req.params.semesterId;
  const { year, semester, startDate, endDate } = req.body;

  // Validate required fields
  if (!year && !semester && !startDate && !endDate) {
    return res.status(400).json({ message: "Some required value is missing." });
  }

  // Validate year format
  if (year && !/^[0-9]{4}$/.test(year)) {
    return res.status(400).json({ message: "The year format is wrong, please provide 4 digit number (0000 - 9999)." });
  }

  // Validate semester range
  if (semester && (semester < 1 || semester > 3)) {
    return res.status(400).json({ message: "The semester must be a number within the range 1 - 3." });
  }

  // Validate date range
  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ message: "The startDate must be before the endDate." });
  }

  try {
    // check if this semester exists
    const existingSemester = await knex('SEMESTERS').where({ id }).first();

    if (!existingSemester) {
      return res.status(404).json({ message: "This semester is not found." });
    }

    // check if the semester already exists
    if (year && semester) {
      const duplicateSemester = await knex('SEMESTERS')
        .where({ year, semester })
        .andWhere('id', '!=', id)
        .first();

      if (duplicateSemester) {
        return res.status(409).json({ message: "This semester is already existed." });
      }
    }

    // update the semester
    const updatedSemester = await knex('SEMESTERS')
      .where({ id })
      .update({
        year: year || existingSemester.year,
        semester: semester || existingSemester.semester,
        start_date: startDate || existingSemester.startDate,
        end_date: endDate || existingSemester.endDate,
        updated_at: knex.fn.now()
      })
      .returning('*');

    return res.status(200).json({
      success: true,
      semester: updatedSemester[0]
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred.", error: error.message });
  }
}