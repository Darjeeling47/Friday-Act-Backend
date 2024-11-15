const knex = require('knex')(require('../../../knexfile').development);

module.exports = async (req, res, next) => {
  const id = req.params.semesterId;
  const { year, semester, startDate, endDate } = req.body;

  // Validate required fields
  if (!year && !semester && !startDate && !endDate) {
    return res.status(400).json({ message: "Some required value is missing.", success: false });
  }

  // Validate year format
  if (year && !/^[0-9]{4}$/.test(year)) {
    return res.status(400).json({ message: "The year format is wrong, please provide 4 digit number (0000 - 9999).", success: false });
  }

  // Validate semester range
  if (semester && (semester < 1 || semester > 3)) {
    return res.status(400).json({ message: "The semester must be a number within the range 1 - 3.", success: false });
  }

  // Validate date range
  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ message: "The startDate must be before the endDate.", success: false });
  }

  try {
    // check if this semester exists
    const existingSemester = await knex('SEMESTERS').where({ id }).first();

    if (!existingSemester) {
      return res.status(404).json({ message: "This semester is not found.", success: false });
    }

    // check if the start date is before the end date
    if (startDate && !endDate && new Date(startDate) >= new Date(existingSemester.end_date)) {
      return res.status(400).json({ message: "The startDate must be before the endDate.", success: false });
    }
    if (endDate && !startDate && new Date(existingSemester.start_date) >= new Date(endDate)) {
      return res.status(400).json({ message: "The startDate must be before the endDate.", success: false });
    }

    // check if the semester already exists
    if (year && semester) {
      const duplicateSemester = await knex('SEMESTERS')
        .where({ year, semester })
        .andWhere('id', '!=', id)
        .first();

      if (duplicateSemester) {
        return res.status(409).json({ message: "This semester is already existed.", success: false  });
      }
    }
    
    // update the semester
    const updatedSemester = await knex('SEMESTERS')
      .where({ id })
      .update({
        year: year || existingSemester.year,
        semester: semester || existingSemester.semester,
        start_date: startDate || existingSemester.start_date,
        end_date: endDate || existingSemester.end_date,
        updated_at: knex.fn.now()
      })
      .returning('*');

    return res.status(200).json({
      success: true,
      semester: updatedSemester[0]
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred.", success: false });
  }
}